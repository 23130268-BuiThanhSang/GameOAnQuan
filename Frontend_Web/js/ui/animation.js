/**
 * js/ui/animation.js
 * Quản lý GSAP Timeline và VFX
 */

const dropSound = new Audio('assets/sounds/drop.mp3'); dropSound.volume = 0.6;
const pickupSound = new Audio('assets/sounds/pickup.mp3'); pickupSound.volume = 0.6;

const Animation = {
    spawnRippleVFX(targetHole) {
        let ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        targetHole.appendChild(ripple);
        gsap.fromTo(ripple,
            { scale: 0.1, opacity: 1, borderWidth: "5px" },
            { scale: 4.5, opacity: 0, borderWidth: "1px", duration: 0.6, ease: "expo.out", onComplete: () => ripple.remove() }
        );
    },

    animateRaiQuan(startHoleId, direction, pathArray, finalGameState, movingPlayerId) {
        if (!pathArray || pathArray.length === 0) {
            BoardRender.renderFullState(finalGameState);
            return;
        }

        const hand = document.getElementById("anim-hand");
        const tl = gsap.timeline();
        let hasCaptured = false;
        let virtualBoard = {};
        for(let i=0; i<12; i++) {
            let id = GameController.getHoleId(i);
            virtualBoard[id] = BoardRender.getPieceCount(id);
        }

        let currIndex = GameController.getBackendIndex(startHoleId);
        let handIsFull = true;
        const getCenterPos = (id) => {
            const rect = document.getElementById(id).getBoundingClientRect();
            return { x: rect.left + rect.width / 2 - 10, y: rect.top + rect.height / 2 - 5 };
        };

        const startPos = getCenterPos(startHoleId);
        tl.set(hand, { x: startPos.x, y: startPos.y });
        tl.to(hand, { opacity: 1, duration: 0.2 });
        tl.to(hand, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 });
        tl.call(() => {
            pickupSound.currentTime = 0; pickupSound.play().catch(()=>{});
            BoardRender.clearHole(startHoleId);
            virtualBoard[startHoleId] = 0;
        });

        pathArray.forEach(targetId => {
            let targetIndex = GameController.getBackendIndex(targetId);

            while (currIndex !== targetIndex) {
                currIndex = (currIndex + direction + 12) % 12;
                let stepId = GameController.getHoleId(currIndex);
                let pos = getCenterPos(stepId);

                tl.to(hand, { x: pos.x, y: pos.y, duration: 0.35, ease: "power1.inOut" });

                if (currIndex !== targetIndex) {
                    if (virtualBoard[stepId] > 0) {
                        handIsFull = true;
                        virtualBoard[stepId] = 0;
                        tl.to(hand, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 });
                        tl.call(() => {
                            pickupSound.currentTime = 0; pickupSound.play().catch(()=>{});
                            BoardRender.clearHole(stepId);
                        });
                    } else {
                        handIsFull = false;
                    }
                } else {
                    if (handIsFull) {
                        // Thả 1 viên
                        virtualBoard[stepId]++;
                        tl.to(hand, { y: "+=15", duration: 0.12, yoyo: true, repeat: 1 });
                        tl.call(() => {
                            dropSound.currentTime = 0; dropSound.play().catch(()=>{});
                            this.spawnRippleVFX(document.getElementById(stepId));
                            BoardRender.incrementHole(stepId);
                        });
                    } else {
                        handIsFull = true;
                        hasCaptured = true;
                        virtualBoard[stepId] = 0;
                        tl.to(hand, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1 }); // Đập mạnh ăn ngọc
                        tl.call(() => {
                            pickupSound.currentTime = 0; pickupSound.play().catch(()=>{});
                            this.spawnRippleVFX(document.getElementById(stepId));
                            BoardRender.clearHole(stepId);
                        });
                    }
                }
            }
        });

        if (hasCaptured) {
            const trayId = movingPlayerId === 1 ? 'tray-p1' : 'tray-p2';
            const boxArea = document.querySelector(`#${trayId} .captured-box`);

            if (boxArea) {
                const rect = boxArea.getBoundingClientRect();

                const dropX = rect.left - 40;
                const dropY = rect.top + rect.height/2 - 10;

                tl.to(hand, { x: dropX, y: dropY, duration: 0.5, ease: "power2.inOut" });
                tl.to(hand, { y: "+=15", duration: 0.15, yoyo: true, repeat: 1 });
            }
        }

        tl.to(hand, { opacity: 0, duration: 0.3, delay: hasCaptured ? 0.1 : 0.3 });
        tl.call(() => {
            BoardRender.renderFullState(finalGameState);
            GameController.isAnimating = false;
        });
    }
};
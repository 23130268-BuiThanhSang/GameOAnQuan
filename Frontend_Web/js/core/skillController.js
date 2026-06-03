/**
 * @file skillController.js
 * @description Quản lý hiệu ứng kích hoạt và logic chọn mục tiêu của thẻ kỹ năng
 */

const SkillController = {
    activateSkill: function(cardElement, cardId, sloganText) {
        const ownerId = cardElement.closest('#skill-tray-p1') ? 1 : 2;
        if (ownerId !== GameController.currentPlayerId) {
            alert("Chưa tới lượt của bạn, cất tay đi!");
            return;
        }

        GameController.isAnimating = true;

        const rect = cardElement.getBoundingClientRect();
        const overlay = document.getElementById('skill-overlay');
        const flyingCard = document.getElementById('flying-card');
        const slogan = document.getElementById('skill-slogan');

        flyingCard.style.backgroundImage = `url('assets/images/skills/${cardId}.png')`;
        slogan.innerText = sloganText;

        gsap.set(overlay, { autoAlpha: 1 });
        const isInstantCast = (cardId === 'DOUBLE_CAPTURE');

        const tl = gsap.timeline({
            onComplete: async () => {
                gsap.to(overlay, { autoAlpha: 0, duration: 0.3 });
                cardElement.remove();

                if (isInstantCast) {
                    try {
                        const responseData = await ApiClient.sendUseSkill(ownerId, cardId, -1);
                        if (!responseData || responseData.status === "error") {
                            alert(responseData?.message || "Lỗi khi dùng thẻ!");
                        } else {
                            if (typeof AudioController !== 'undefined') AudioController.play('drop');
                            alert("Kích hoạt thành công! Lượt này bạn sẽ được X2 điểm.");
                        }
                    } catch(e) {
                        console.error(e);
                    }
                    GameController.isAnimating = false;
                } else {
                    GameController.pendingSkillId = cardId;
                    SkillController.highlightTargets(cardId, ownerId);
                    console.log(`[Mock] Đã tung chiêu! Đợi click vào ô để áp dụng ${cardId}...`);
                }
            }
        });

        tl.fromTo(flyingCard,
            { x: rect.left - (window.innerWidth / 2) + (rect.width / 2), y: rect.top - (window.innerHeight / 2) + (rect.height / 2), scale: 0.3, rotationY: 0, rotation: 0, opacity: 1 },
            { x: 0, y: -50, scale: 1.5, rotationY: 360, duration: 0.8, ease: "back.out(1.2)" }
        )
            .to(slogan, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
            .to(flyingCard, { scale: 0, opacity: 0, rotation: 45, duration: 0.4, delay: 1, ease: "back.in(1.5)" })
            .to(slogan, { opacity: 0, y: 20, duration: 0.3 }, "<");
    },

    highlightTargets: function(skillId, playerId) {
        if (skillId === 'BONUS_SEED') {
            let start = playerId === 1 ? 0 : 6;
            let end = playerId === 1 ? 4 : 10;

            for (let i = start; i <= end; i++) {
                let holeId = GameController.getHoleId(i);
                let el = document.getElementById(holeId);
                if (el) el.classList.add('targetable-hole');
            }
        }
        if (skillId === 'LOCK_TILE') {
            let start = playerId === 1 ? 6 : 0;
            let end = playerId === 1 ? 10 : 4;

            for (let i = start; i <= end; i++) {
                let holeId = GameController.getHoleId(i);
                let el = document.getElementById(holeId);
                if (el && !el.classList.contains('locked-tile-visual')) {
                    el.classList.add('targetable-hole');
                }
            }
        }
    },
    clearHighlights: function() {
        document.querySelectorAll('.targetable-hole').forEach(el => {
            el.classList.remove('targetable-hole');
        });
    },

    handleSkillTargeting: async function(clickedHoleId, skillId) {
        const index = GameController.getBackendIndex(clickedHoleId);
        const playerId = GameController.currentPlayerId;

        if (skillId === 'LOCK_TILE') {
            let start = playerId === 1 ? 6 : 0;
            let end = playerId === 1 ? 10 : 4;
            if (index < start || index > end) {
                alert("Lệnh cấm vận phải giáng xuống đầu đối thủ! Hãy chọn ô của địch.");
                return;
            }
        }

        if (skillId === 'BONUS_SEED') {
            let start = playerId === 1 ? 0 : 6;
            let end = playerId === 1 ? 4 : 10;
            if (index < start || index > end) {
                alert("Hãy chọn vào các ô đang phát sáng của bạn!");
                return;
            }
        }

        this.clearHighlights();

        try {
            const responseData = await ApiClient.sendUseSkill(playerId, skillId, index);

            if (!responseData || responseData.status === "error") {
                alert("Lỗi khi sử dụng kỹ năng!");
                GameController.pendingSkillId = null;
                GameController.isAnimating = false;
                return;
            }

            if (skillId === 'BONUS_SEED') {
                const holeEl = document.getElementById(clickedHoleId);
                const floatText = document.createElement('div');
                floatText.innerText = "+1 dân";
                floatText.style.position = 'absolute';
                floatText.style.color = '#32cd32';
                floatText.style.fontWeight = 'bold';
                floatText.style.fontSize = '1.3rem';
                floatText.style.textShadow = '1px 1px 2px #000';
                floatText.style.zIndex = '200';
                floatText.style.pointerEvents = 'none';
                floatText.style.top = '30%';
                floatText.style.left = '50%';
                floatText.style.transform = 'translate(-50%, 0)';

                if (getComputedStyle(holeEl).position === 'static') {
                    holeEl.style.position = 'relative';
                }
                holeEl.appendChild(floatText);

                if (typeof AudioController !== 'undefined') AudioController.play('drop');

                gsap.to(floatText, {
                    y: -40, opacity: 0, duration: 1.5, ease: "power1.out",
                    onComplete: () => floatText.remove()
                });
            } else if (skillId === 'LOCK_TILE') {
                if (typeof AudioController !== 'undefined') AudioController.play('capture');
            }

            setTimeout(() => {
                BoardRender.renderFullState(responseData);
            }, 50);

            GameController.pendingSkillId = null;
            GameController.isAnimating = false;

        } catch (err) {
            console.error("Lỗi API kỹ năng:", err);
            GameController.pendingSkillId = null;
            GameController.isAnimating = false;
        }
    }
};
/**
 * @file skillController.js
 * @description Quản lý hiệu ứng kích hoạt và logic chọn mục tiêu của thẻ kỹ năng
 */

const SkillController = {
    // 9.1.1 Người chơi chọn thẻ kỹ năng
    // → Trigger từ UI (click event) → gọi vào SkillController.activateSkill()

    // 9.1.2 Kiểm tra điều kiện sử dụng (đúng lượt / thẻ đặc biệt)
    // 9.2.1 Nếu sai lượt → từ chối

    activateSkill: function(cardElement, cardId, sloganText) {
        // [SkillController.activateSkill]
        // Xác định owner của thẻ (player 1 hoặc 2)
        const ownerId = cardElement.closest('#skill-tray-p1') ? 1 : 2;
        // 9.1.2 + 9.2.1 (SkillController.activateSkill)
        if (cardId !== 'SEIZE_COMMAND' && ownerId !== GameController.currentPlayerId) {
            alert("Chưa tới lượt của bạn, cất tay đi!");
            return;
        }
        // 9.1.3 (SkillController.activateSkill)
        // Kích hoạt animation
        GameController.isAnimating = true;

        const rect = cardElement.getBoundingClientRect();
        const overlay = document.getElementById('skill-overlay');
        const flyingCard = document.getElementById('flying-card');
        const slogan = document.getElementById('skill-slogan');

        // reset trạng thái flyingCard trước mỗi animation
        gsap.killTweensOf(flyingCard);
        gsap.set(flyingCard, {scale: 1, opacity: 1, rotation: 0, rotationY: 0});

        flyingCard.style.backgroundImage = `url('assets/images/skills/${cardId}.png')`;
        slogan.innerText = sloganText;

        gsap.set(overlay, {autoAlpha: 1});
        const isInstantCast = (cardId === 'DOUBLE_CAPTURE' || cardId === 'SEIZE_COMMAND'||
            cardId==="STEAL_CARD"|| cardId==="REMOVE_HIGHEST_CARD");

        // 11.1.1: Người chơi bấm chọn kích hoạt thẻ, Client thiết lập khung overlay ẩn và tạo chuỗi hoạt ảnh bằng GSAP Timeline.
        const tl = gsap.timeline({
            onComplete: async () => {
                gsap.to(overlay, {autoAlpha: 0, duration: 0.3});

                // 9.1.3 (SkillController.activateSkill)
                // Xóa thẻ khỏi UI sau animation
                cardElement.remove();

                // 11.1.3: Kết thúc hiệu ứng, Client kiểm tra loại thẻ. Nếu là thẻ tác dụng ngay (Instant Cast), Client gọi API gửi trực tiếp xuống Backend.
                // 9.1.5 (ApiClient.sendUseSkill)
                // Gửi request tới backend (không cần target)
                if (isInstantCast) {
                    try {
                        let responseData;

                        if (cardId === 'SEIZE_COMMAND') {
                            // SEIZE_COMMAND dùng endpoint khác
                            const response = await fetch('http://localhost:8080/api/game/card/use', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    playerId: ownerId,
                                    cardId: cardId
                                })
                            });
                            responseData = await response.json();
                        } else {
                            // DOUBLE_CAPTURE dùng endpoint cũ
                            responseData = await ApiClient.sendUseSkill(ownerId, cardId, -1);
                        }
                        // 9.4.1 (Frontend xử lý lỗi backend)
                        if (!responseData || responseData.status === "error") {
                            alert(responseData?.message || "Lỗi khi dùng thẻ!");
                        } else {
                            if (typeof AudioController !== 'undefined') {
                                AudioController.play('drop');
                            }
                            // 9.1.8 (BoardRender.renderFullState)
                            // Update UI theo state mới từ backend
                            BoardRender.renderFullState(responseData);
                        }
                    } catch (e) {
                        console.error(e);
                    }

                    GameController.isAnimating = false;
                } else {
                    // 11.1.4: Nếu là thẻ chọn mục tiêu, Client gán ID thẻ vào pendingSkillId và làm sáng các ô cờ hợp lệ để chờ người chơi click chọn.
                    // 9.1.4 (SkillController.highlightTargets)
                    // Chờ người chơi chọn mục tiêu
                    GameController.pendingSkillId = cardId;
                    SkillController.highlightTargets(cardId, ownerId);


                    GameController.isAnimating = false;

                    console.log(`[Mock] Đã tung chiêu! Đợi click vào ô để áp dụng ${cardId}...`);
                }
            }
        });

        // 11.1.2: Thẻ bay từ khay ra giữa màn hình, thực hiện hiệu ứng xoay 3D (rotationY) và hiển thị Slogan.
        tl.fromTo(flyingCard,
            {
                x: rect.left - (window.innerWidth / 2) + (rect.width / 2),
                y: rect.top - (window.innerHeight / 2) + (rect.height / 2),
                scale: 0.3,
                rotationY: 0,
                rotation: 0,
                opacity: 1
            },
            {
                x: 0,
                y: -50,
                scale: 1.5,
                rotationY: 360,
                duration: 0.8,
                ease: "back.out(1.2)"
            }
        )
            .to(slogan, {opacity: 1, y: 0, duration: 0.4, ease: "power2.out"}, "-=0.3")
            .to(flyingCard, {scale: 0, opacity: 0, rotation: 45, duration: 0.4, delay: 1, ease: "back.in(1.5)"})
            .to(slogan, {opacity: 0, y: 20, duration: 0.3}, "<");
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
    // 9.1.4 Người chơi chọn target
    // 9.3.1 Validate target
    // 9.1.5 Gửi API
    handleSkillTargeting: async function(clickedHoleId, skillId) {
        // [SkillController.handleSkillTargeting]
        // Convert UI → backend index
        const index = GameController.getBackendIndex(clickedHoleId);
        const playerId = GameController.currentPlayerId;
        // 9.3.1 (SkillController.handleSkillTargeting)
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
            // 9.1.5 (ApiClient.sendUseSkill)
            const responseData = await ApiClient.sendUseSkill(playerId, skillId, index);
            // 9.4.1.Nếu backend xử lý lỗi → trả thông báo lỗi
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
            GameController.pendingSkillId = null;
            GameController.isAnimating = false;
            SkillController.clearHighlights();
            setTimeout(() => {
                // 9.1.8 (BoardRender.renderFullState)
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
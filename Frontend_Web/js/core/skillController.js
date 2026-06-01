/**
 * @file skillController.js
 * @description Quản lý hiệu ứng kích hoạt và logic chọn mục tiêu của thẻ kỹ năng
 */

const SkillController = {
    activateSkill: function(cardElement, cardId, sloganText) {
        GameController.isAnimating = true;

        const rect = cardElement.getBoundingClientRect();
        const overlay = document.getElementById('skill-overlay');
        const flyingCard = document.getElementById('flying-card');
        const slogan = document.getElementById('skill-slogan');

        flyingCard.style.backgroundImage = `url('assets/images/skills/${cardId}.png')`;
        slogan.innerText = sloganText;

        gsap.set(overlay, { autoAlpha: 1 });

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(overlay, { autoAlpha: 0, duration: 0.3 });
                cardElement.remove(); // Hủy thẻ trong khay

                // Khóa GameController lại, chuyển sang chế độ chờ chọn mục tiêu cho skill
                GameController.pendingSkillId = cardId;
                console.log(`[Mock] Đã tung chiêu! Đợi click vào ô để áp dụng ${cardId}...`);
            }
        });

        // Setup vị trí gốc
        tl.fromTo(flyingCard,
            { x: rect.left - (window.innerWidth / 2) + (rect.width / 2), y: rect.top - (window.innerHeight / 2) + (rect.height / 2), scale: 0.3, rotationY: 0 },
            { x: 0, y: -50, scale: 1.5, rotationY: 360, duration: 0.8, ease: "back.out(1.2)" }
        )
            .to(slogan, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
            .to(flyingCard, { scale: 0, opacity: 0, rotation: 45, duration: 0.4, delay: 1, ease: "back.in(1.5)" })
            .to(slogan, { opacity: 0, y: 20, duration: 0.3 }, "<");
    },

    handleSkillTargeting: async function(clickedHoleId, skillId) {
        // KIỂM TRA LOGIC FRONTEND CƠ BẢN TRƯỚC KHI GỌI API
        const index = GameController.getBackendIndex(clickedHoleId);

        if (skillId === 'BONUS_SEED') {
            if (clickedHoleId === "quan-right" || clickedHoleId === "quan-left") {
                alert("Bonus Seed không rắc được vào ô Quan đâu, chọn ô Dân đi!");
                return; // Trả về để người chơi chọn lại ô khác
            }
        }

        // MOCK API CHỖ NÀY
        alert(`[GIẢ LẬP GỌI API] Đã gửi request: Dùng thẻ ${skillId} vào ô ${clickedHoleId}.\n\n(Chờ Backend viết API xong thì thay alert này bằng fetch)`);

        // Sau khi xài xong, dọn dẹp trạng thái để chơi bình thường
        GameController.pendingSkillId = null;
        GameController.isAnimating = false;
    }
};
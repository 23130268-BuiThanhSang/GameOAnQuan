/**
 * js/main.js
 * Khởi tạo ứng dụng
 */

document.addEventListener("DOMContentLoaded", async () => {
    const hand = document.getElementById("anim-hand");
    if (hand && hand.parentElement !== document.body) {
        document.body.appendChild(hand);
        hand.style.position = "fixed";
        hand.style.top = "0px";
        hand.style.left = "0px";
        hand.style.zIndex = "9999";
    }

    try {
        const response = await fetch('http://localhost:8080/api/game/board');
        const initialData = await response.json();
        BoardRender.renderFullState(initialData);
    } catch (error) {
        console.error("Chưa kết nối được Backend:", error);
    }

    for (let i = 0; i <= 10; i++) {
        if (i === 5) continue;
        let holeId = `dan-${i}`;
        let holeElement = document.getElementById(holeId);

        if (holeElement) {
            holeElement.addEventListener("click", () => {
                GameController.handleTileClick(holeId);
            });
        }
    }
});
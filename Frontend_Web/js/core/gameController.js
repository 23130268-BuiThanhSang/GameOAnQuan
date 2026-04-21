/**
 * js/core/gameController.js
 * Quản lý vòng lặp game ở Client
 */

const GameController = {
    isAnimating: false,
    currentPlayerId: 1,

    getBackendIndex(holeId) {
        if (holeId === "quan-right") return 5;
        if (holeId === "quan-left") return 11;
        return parseInt(holeId.replace("dan-", ""));
    },
    getHoleId(index) {
        if (index === 5) return "quan-right";
        if (index === 11) return "quan-left";
        return `dan-${index}`;
    },
    async handleTileClick(holeId) {
        if (this.isAnimating) return;

        const startIndex = this.getBackendIndex(holeId);
        const isClockwise = window.confirm("Bạn muốn rải cùng chiều kim đồng hồ?\n[OK]: Cùng chiều\n[Cancel]: Ngược chiều");
        const direction = isClockwise ? 1 : -1;

        this.isAnimating = true;
        const responseData = await ApiClient.sendMove(startIndex, direction);

        if (!responseData || responseData.status === "error") {
            alert(responseData?.message || "Nước đi không hợp lệ!");
            this.isAnimating = false;
            return;
        }
        const movingPlayerId = this.currentPlayerId;

        this.currentPlayerId = responseData.currentPlayer;

        Animation.animateRaiQuan(holeId, direction, responseData.animationPath, responseData, movingPlayerId);
    }
};
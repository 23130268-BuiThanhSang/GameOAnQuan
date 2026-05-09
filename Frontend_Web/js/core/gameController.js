/**
 * js/core/gameController.js
 * Quản lý vòng lặp game ở Client
 */

const GameController = {
    isAnimating: false,
    isGameOver: false,
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

        if (this.isAnimating || this.isGameOver) return;

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
        if (responseData && responseData.status === "game_complete") {
            this.isGameOver = true;
        }
        Animation.animateRaiQuan(
            holeId,
            direction,
            responseData.animationPath,
            responseData,
            movingPlayerId,
            () => {
                if (responseData.scatterEvent) {
                    const scatterPlayerId = responseData.scatterEvent.includes("P1") ? 1 : 2;
                    const isBorrowing = responseData.scatterEvent.includes("BORROW");
                    Animation.animateVayQuan(scatterPlayerId, isBorrowing, () => {
                        BoardRender.renderFullState(responseData);
                        GameController.currentPlayerId = responseData.currentPlayer;
                        GameController.isAnimating = false;
                    });
                } else {
                    BoardRender.renderFullState(responseData);
                    GameController.currentPlayerId = responseData.currentPlayer;
                    GameController.isAnimating = false;
                }
            }
        );
    },
    async resign(playerId) {
        if (this.isGameOver) return;

        if (this.currentPlayerId !== playerId) {
            alert("Chưa tới lượt của bạn, không được ăn vạ!");
            return;
        }

        const confirmResign = window.confirm("Gạo đã cạn, bạn có chắc chắn muốn nhận thua không?");
        if (!confirmResign) return;

        this.isAnimating = true;
        try {
            const responseData = await ApiClient.sendResign(playerId);

            if (responseData && responseData.status === "game_complete") {
                this.isGameOver = true;

                let winnerDisplayName = responseData.winner;
                if (winnerDisplayName === "Player 1") {
                    winnerDisplayName = localStorage.getItem('oanquan_p1') || "Player 1";
                } else if (winnerDisplayName === "Player 2") {
                    winnerDisplayName = localStorage.getItem('oanquan_p2') || "Player 2";
                }

                document.getElementById('winnerName').innerText = `${winnerDisplayName} Thắng Áp Đảo!`;

                document.getElementById('gameOverModal').style.display = 'flex';

                const gameOverSound = new Audio('assets/sounds/win.mp3');
                gameOverSound.play().catch(()=>{});
            } else {
                console.warn("Lỗi logic: Server không trả về game_complete", responseData);
            }
        } catch (error) {
            console.error("Lỗi kết nối khi đầu hàng:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
        this.isAnimating = false;
    },
    async resetGame() {
        try {
            const responseData = await ApiClient.sendReset();

            if (responseData && responseData.status === "success") {
                // 1. Ẩn Popup đi
                document.getElementById('gameOverModal').style.display = 'none';

                // 2. Mở khóa trạng thái game
                this.isGameOver = false;
                this.isAnimating = false;

                // 3. Render lại bàn cờ mới tinh
                BoardRender.renderFullState(responseData);
                this.currentPlayerId = responseData.currentPlayer;
            }
        } catch (error) {
            console.error("Lỗi khi bày lại ván:", error);
            alert("Lỗi kết nối khi reset game!");
        }
    }
};
/**
 * js/core/gameController.js
 * Quản lý vòng lặp game ở Client
 */

const GameController = {
    isAnimating: false,
    isGameOver: false,
    currentPlayerId: 1,
    selectedHoleId: null,

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
        if (holeId === "quan-right" || holeId === "quan-left") return;
        this.removeDirectionSelector();
        this.selectedHoleId = holeId;
        this.showDirectionSelector(holeId);
    },

    showDirectionSelector(holeId) {
        const holeElement = document.getElementById(holeId);
        if (!holeElement) return;

        const index = this.getBackendIndex(holeId);
        let leftDir = -1;
        let rightDir = 1;

        if (index >= 6 && index <= 10) {
            leftDir = 1;
            rightDir = -1;
        }

        const selectorUI = document.createElement('div');
        selectorUI.className = 'direction-selector';
        selectorUI.id = 'current-direction-selector';

        selectorUI.innerHTML = `
            <button class="arrow-btn" onclick="GameController.confirmMove(${leftDir}, event)" title="Rải sang trái">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <button class="arrow-btn" onclick="GameController.confirmMove(${rightDir}, event)" title="Rải sang phải">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        `;

        holeElement.appendChild(selectorUI);
    },

    removeDirectionSelector() {
        const existingSelector = document.getElementById('current-direction-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
        this.selectedHoleId = null;
    },

    async confirmMove(direction, event) {
        if (event) event.stopPropagation();

        const holeId = this.selectedHoleId;
        if (!holeId) return;
        this.removeDirectionSelector();

        const startIndex = this.getBackendIndex(holeId);
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
        const onTurnFinished = () => {
            BoardRender.renderFullState(responseData);
            GameController.currentPlayerId = responseData.currentPlayer;
            GameController.isAnimating = false; // Mở khóa bàn cờ

            if (responseData.fullTurnCount !== undefined) {
                const turnDisplay = document.getElementById('current-turn-display');
                if (turnDisplay) {
                    turnDisplay.innerText = responseData.fullTurnCount;
                }
            }

            if (responseData.inShop) {
                setTimeout(() => {
                    ShopController.openShop(responseData);
                }, 300);
            }
        };

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
                    Animation.animateVayQuan(scatterPlayerId, isBorrowing, onTurnFinished);
                } else {
                    onTurnFinished();
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
                document.getElementById('gameOverModal').style.display = 'none';

                this.isGameOver = false;
                this.isAnimating = false;

                if (responseData.fullTurnCount !== undefined) {
                    const turnDisplay = document.getElementById('current-turn-display');
                    if (turnDisplay) turnDisplay.innerText = responseData.fullTurnCount;
                }

                const tray1 = document.getElementById('skill-tray-p1');
                const tray2 = document.getElementById('skill-tray-p2');

                const emptyTrayHTML = `<span class="empty-tray-text">Kỹ năng (Trống)</span>`;
                if (tray1) tray1.innerHTML = emptyTrayHTML;
                if (tray2) tray2.innerHTML = emptyTrayHTML;

                if (typeof ShopController !== 'undefined') {
                    ShopController.shopDataP1 = [];
                    ShopController.shopDataP2 = [];
                    ShopController.selectedCardsP1 = [];
                    ShopController.selectedCardsP2 = [];
                }

                BoardRender.renderFullState(responseData);
                this.currentPlayerId = responseData.currentPlayer;
            }
        } catch (error) {
            console.error("Lỗi khi bày lại ván:", error);
            alert("Lỗi kết nối khi reset game!");
        }
    }
};
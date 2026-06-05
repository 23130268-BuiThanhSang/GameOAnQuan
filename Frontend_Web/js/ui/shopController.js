/**
 * @file shopController.js
 * @description Quản lý luồng giao diện Cửa hàng kỹ năng và các tương tác chọn thẻ
 */

const ShopController = {
    currentShopTurn: 1,
    selectedCardsP1: [],
    selectedCardsP2: [],

    shopTimeLimit: 10,
    shopTimeLeft: 10,
    shopTimerInterval: null,

    shopDataP1: [],
    shopDataP2: [],

    rerolledP1: [],
    rerolledP2: [],

    openShop: function(data) {
        this.currentShopTurn = 1;
        this.selectedCardsP1 = [];
        this.selectedCardsP2 = [];

        this.shopDataP1 = data.p1ShopOptions || [];
        this.shopDataP2 = data.p2ShopOptions || [];

         this.rerolledP1 = [];
         this.rerolledP2 = [];

        document.getElementById('shopModal').style.display = 'flex';

        document.getElementById('shop-score-p1').innerText = data.scores.player1;
        document.getElementById('shop-score-p2').innerText = data.scores.player2;

        this.renderCards(1, this.shopDataP1);
        this.renderCards(2, this.shopDataP2);

        this.updateTurnUI();
        this.startShopTimer();
    },

renderCards: function(playerId, options) {
    const container = document.getElementById(`cards-container-p${playerId}`);
    if (!container) return;

    container.innerHTML = '';

    if (!options || options.length === 0) {
        container.innerHTML = `<p style="color:#8b4513; font-weight:bold;">Không có thẻ để hiển thị</p>`;
        return;
    }

    options.forEach((card, index) => {
        const rerolledList = (playerId === 1) ? this.rerolledP1 : this.rerolledP2;
        const alreadyRerolled = !!rerolledList[index];

        container.innerHTML += `
            <div class="card-wrapper">
                <div class="card-item" onclick="ShopController.toggleCard(this, ${playerId}, '${card.id}', ${card.cost})">
                    <img src="assets/images/skills/${card.id}.png"
                         onerror="this.src='assets/images/skills/BONUS_SEED.png'"
                         alt="${card.name}"
                         style="width: 100%; height: 40%; object-fit: cover; border-bottom: 2px solid #deb887; object-position: top;">
                    <div class="card-info">
                        <p class="card-name">${card.name}</p>
                        <p class="card-desc">${card.description}</p>
                        <b class="card-price">${card.cost} Điểm</b>
                    </div>
                </div>

                <button class="btn-reroll ${alreadyRerolled ? 'rerolled' : ''}"
                        ${alreadyRerolled ? 'disabled' : ''}
                        onclick="event.stopPropagation(); ShopController.rerollCard(${playerId}, ${index})"
                        title="Đổi thẻ này, chỉ 1 lần">
                    <i class="fa-solid fa-rotate-right"></i>
                </button>
            </div>
        `;
    });
},

rerollCard: async function(playerId, cardIndex) {
    if (playerId !== this.currentShopTurn) {
        alert(`Đang là lượt của Player ${this.currentShopTurn}, không được đổi thẻ của người khác!`);
        return;
    }

    const rerolledList = (playerId === 1) ? this.rerolledP1 : this.rerolledP2;

    if (rerolledList[cardIndex]) {
        alert("Thẻ này đã đổi 1 lần rồi!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/game/shop/reroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: playerId,
                cardIndex: cardIndex
            })
        });

        const data = await response.json();

        if (!data || data.status === 'error') {
            alert(data?.message || "Không thể đổi thẻ!");
            return;
        }

        this.shopDataP1 = data.p1ShopOptions || this.shopDataP1;
        this.shopDataP2 = data.p2ShopOptions || this.shopDataP2;

        rerolledList[cardIndex] = true;

        if (playerId === 1) {
            this.selectedCardsP1 = [];
        } else {
            this.selectedCardsP2 = [];
        }

        this.renderCards(1, this.shopDataP1);
        this.renderCards(2, this.shopDataP2);

    } catch (error) {
        console.error("Lỗi reroll:", error);
        alert("Không thể kết nối backend để đổi thẻ!");
    }
},

    updateTurnUI: function() {
        const title = document.getElementById('shop-turn-title');
        const btnConfirm = document.getElementById('btn-confirm-shop');
        const areaP1 = document.getElementById('shop-area-p1');
        const areaP2 = document.getElementById('shop-area-p2');

        if (this.currentShopTurn === 1) {
            title.innerText = "Đến Lượt Player 1 Chọn Thẻ";
            btnConfirm.innerText = "Chốt Lựa Chọn (Player 1)";
            areaP1.classList.remove('inactive-area');
            areaP2.classList.add('inactive-area');
        } else {
            title.innerText = "Đến Lượt Player 2 Chọn Thẻ";
            btnConfirm.innerText = "Chốt Lựa Chọn (Player 2)";
            areaP2.classList.remove('inactive-area');
            areaP1.classList.add('inactive-area');
        }
    },

    toggleCard: function(element, playerId, cardId, cost) {
        if (playerId !== this.currentShopTurn) {
            alert(`Khoan đã, đang là lượt chọn của Player ${this.currentShopTurn}!`);
            return;
        }

        const selectedList = (playerId === 1) ? this.selectedCardsP1 : this.selectedCardsP2;

        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            const index = selectedList.indexOf(cardId);
            if (index > -1) selectedList.splice(index, 1);
        } else {
            element.classList.add('selected');
            selectedList.push(cardId);
        }
    },

rerollCard: async function(playerId, cardIndex) {
    if (playerId !== this.currentShopTurn) {
        alert(`Đang là lượt của Player ${this.currentShopTurn}, không được đổi thẻ của người khác!`);
        return;
    }

    const rerolledList = (playerId === 1) ? this.rerolledP1 : this.rerolledP2;

    if (rerolledList[cardIndex]) {
        alert("Thẻ này đã đổi 1 lần rồi!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/game/shop/reroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: playerId,
                cardIndex: cardIndex
            })
        });

        const data = await response.json();

        if (!data || data.status === 'error') {
            alert(data?.message || "Không thể đổi thẻ!");
            return;
        }

        this.shopDataP1 = data.p1ShopOptions || this.shopDataP1;
        this.shopDataP2 = data.p2ShopOptions || this.shopDataP2;

        rerolledList[cardIndex] = true;

        if (playerId === 1) {
            this.selectedCardsP1 = [];
        } else {
            this.selectedCardsP2 = [];
        }

        this.renderCards(1, this.shopDataP1);
        this.renderCards(2, this.shopDataP2);

    } catch (error) {
        console.error("Lỗi reroll:", error);
        alert("Không thể kết nối backend để đổi thẻ!");
    }
},


    addCardToTray: function(playerId, cardId) {
        const tray = document.getElementById(`skill-tray-p${playerId}`);
        const shopData = (playerId === 1) ? this.shopDataP1 : this.shopDataP2;

        const cardInfo = shopData.find(c => c.id === cardId);
        if (!cardInfo) return;

        const emptyText = tray.querySelector('.empty-tray-text');
        if (emptyText) emptyText.remove();

        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.style.backgroundImage = `url('assets/images/skills/${cardInfo.id}.png'), url('assets/images/skills/BONUS_SEED.png')`;

        miniCard.innerHTML = `
            <div class="mini-card-tooltip">
                <div class="tooltip-title">${cardInfo.name}</div>
                <div class="tooltip-desc">${cardInfo.description}</div>
                <div class="tooltip-desc"><b>Bấm để kích hoạt</b></div>
            </div>
        `;

        miniCard.onclick = () => {
            if (GameController.currentPlayerId !== playerId) {
                alert("Chưa tới lượt, không được xài ké thẻ của người khác!");
                return;
            }

            if (cardInfo.id === 'DOUBLE_CAPTURE') {
                SkillController.activateSkill(
                    miniCard,
                    cardInfo.id,
                    "Ăn một thành hai, lợi thế nhân đôi!"
                );
                return;
            }

            if (cardInfo.id === 'STEAL_CARD') {
                ShopController.useCard(playerId, cardInfo.id, miniCard);
                return;
            }

            let slogan = "Nhân phẩm bùng nổ!!!";
            if (cardInfo.id === 'LOCK_TILE') {
                slogan = "Lệnh cấm vận! Nông dân đình công!";
            }

            SkillController.activateSkill(miniCard, cardInfo.id, slogan);
        };

        tray.appendChild(miniCard);
    },

    useCard: async function(playerId, cardId, miniCardElement) {
        if (cardId !== 'DOUBLE_CAPTURE' && cardId !== 'STEAL_CARD') {
            return;
        }

        const message = (cardId === 'STEAL_CARD')
                ?"Đánh cắp ngẫu nhiên 1 thẻ đối thủ?"
                :"Bạn có muốn dùng thẻ Nhân đôi điểm không?";

        const confirmUse = confirm(message);

        if (!confirmUse) return;

        try {
            const response = await fetch('http://localhost:8080/api/game/card/use', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: playerId,
                    cardId: cardId
                })
            });

            const data = await response.json();

            if (!data || data.status === 'error') {
                alert(data?.message || "Không thể dùng thẻ!");
                return;
            }

            alert(cardId === 'STEAL_CARD'?"Đã đánh cắp 1 thẻ của đối thủ!":"Đã kích hoạt thẻ Nhân đôi điểm!");

            if (miniCardElement) {
                miniCardElement.remove();
            }

            BoardRender.renderFullState(data);

        } catch (error) {
            console.error("Lỗi khi dùng thẻ:", error);
            alert("Không thể kết nối Backend để dùng thẻ!");
        }
    },

    startShopTimer: function() {
        this.stopShopTimer();

        this.shopTimeLeft = this.shopTimeLimit;
        this.updateShopTimerUI();

        this.shopTimerInterval = setInterval(() => {
            this.shopTimeLeft--;
            this.updateShopTimerUI();

            if (this.shopTimeLeft <= 0) {
                this.stopShopTimer();
                this.skipShopByTimer();
            }
        }, 1000);
    },

    stopShopTimer: function() {
        if (this.shopTimerInterval) {
            clearInterval(this.shopTimerInterval);
            this.shopTimerInterval = null;
        }
    },

    updateShopTimerUI: function() {
        const timer = document.getElementById('shop-timer');
        if (!timer) return;

        timer.innerText = this.shopTimeLeft;

        if (this.shopTimeLeft <= 5) {
            timer.classList.add('timer-warning');
        } else {
            timer.classList.remove('timer-warning');
        }
    },

    skipShopByTimer: async function() {
        const playerId = this.currentShopTurn;

        try {
            const response = await fetch('http://localhost:8080/api/game/shop/skip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: playerId
                })
            });

            const data = await response.json();

            if (!data || data.status === 'error') {
                alert(data?.message || `Player ${playerId} hết giờ nhưng không thể bỏ lượt shop!`);
                return;
            }

            // Nếu Player 1 hết giờ thì chuyển sang Player 2
            if (playerId === 1 && data.inShop) {
                this.currentShopTurn = 2;
                this.updateTurnUI();
                this.startShopTimer();
                return;
            }

            // Nếu Player 2 hết giờ thì đóng shop và tiếp tục game
            if (!data.inShop) {
                this.stopShopTimer();

                const modal = document.getElementById('shopModal');
                if (modal) {
                    modal.style.display = 'none';
                }

                BoardRender.renderFullState(data);
                GameController.currentPlayerId = data.currentPlayer;
                GameController.isAnimating = false;
            }

        } catch (error) {
            console.error("Lỗi auto skip shop:", error);
            alert("Không thể kết nối backend để bỏ lượt shop!");
        }
    },

    confirmSelection: async function() {
        this.stopShopTimer();
        const playerId = this.currentShopTurn;
        const selectedList = (playerId === 1) ? this.selectedCardsP1 : this.selectedCardsP2;
        let finalGameState = null;

        try {
            if (selectedList.length > 0) {
                for (let cId of selectedList) {
                    const response = await fetch('http://localhost:8080/api/game/shop/buy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId: playerId, cardId: cId })
                    });
                    const data = await response.json();

                    if (data && data.status === "error") {
                        alert(data.message);
                    } else {
                        this.addCardToTray(playerId, cId);
                    }
                }
            }
            const skipResponse = await fetch('http://localhost:8080/api/game/shop/skip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: playerId })
            });
            finalGameState = await skipResponse.json();

        } catch (error) {
            console.error("Lỗi kết nối Backend lúc chốt thẻ:", error);
        }

        if (this.currentShopTurn === 1) {
            this.currentShopTurn = 2;
            this.updateTurnUI();
            this.startShopTimer();
        } else {
            document.getElementById('shopModal').style.display = 'none';
            console.log("Cả hai đã chọn xong, game tiếp tục!");
            GameController.isAnimating = false;
        }

        if (finalGameState && typeof BoardRender !== 'undefined') {
            BoardRender.renderFullState(finalGameState);
        }
    }
};
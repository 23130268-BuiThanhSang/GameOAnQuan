/**
 * @file shopController.js
 * @description Quản lý luồng giao diện Cửa hàng kỹ năng và các tương tác chọn thẻ
 */

const ShopController = {
    currentShopTurn: 1,
    selectedCardsP1: [],
    selectedCardsP2: [],

    shopDataP1: [],
    shopDataP2: [],

    openShop: function(data) {
        this.currentShopTurn = 1;
        this.selectedCardsP1 = [];
        this.selectedCardsP2 = [];

        this.shopDataP1 = data.p1ShopOptions || [];
        this.shopDataP2 = data.p2ShopOptions || [];

        document.getElementById('shopModal').style.display = 'flex';

        document.getElementById('shop-score-p1').innerText = data.scores.player1;
        document.getElementById('shop-score-p2').innerText = data.scores.player2;

        this.renderCards(1, this.shopDataP1);
        this.renderCards(2, this.shopDataP2);

        this.updateTurnUI();
    },

    renderCards: function(playerId, options) {
        const container = document.getElementById(`cards-container-p${playerId}`);
        container.innerHTML = '';
        if (options) {
            options.forEach(card => {
                container.innerHTML += `
                    <div class="card-wrapper">
                        <div class="card-item" onclick="ShopController.toggleCard(this, ${playerId}, '${card.id}', ${card.cost})">
                            <img src="assets/images/skills/${card.id}.png" alt="${card.name}" style="width: 100%; height: 40%; object-fit: cover; border-bottom: 2px solid #deb887; object-position: top;">
                            <div class="card-info">
                                <p class="card-name">${card.name}</p>
                                <p class="card-desc">${card.description}</p>
                                <b class="card-price">${card.cost} Điểm</b>
                            </div>
                        </div>
                        <button class="btn-reroll" onclick="ShopController.rerollCard(${playerId}, '${card.id}')" title="Đổi thẻ này (1 lần)">
                            <i class="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>
                `;
            });
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

    rerollCard: function(playerId, cardId) {
        if (playerId !== this.currentShopTurn) {
            alert(`Đang là lượt của Player ${this.currentShopTurn}, bạn không được phá bài người ta!`);
            return;
        }
        alert(`Sẽ gọi API đổi thẻ [${cardId}] thành thẻ mới ở đây!`);
    },

    confirmSelection: async function() {
        const playerId = this.currentShopTurn;
        const selectedList = (playerId === 1) ? this.selectedCardsP1 : this.selectedCardsP2;

        try {
            if (selectedList.length === 0) {
                await fetch('http://localhost:8080/api/game/shop/skip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: playerId })
                });
            } else {
                for (let cId of selectedList) {
                    await fetch('http://localhost:8080/api/game/shop/buy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId: playerId, cardId: cId })
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi kết nối Backend lúc chốt thẻ:", error);
        }
        if (this.currentShopTurn === 1) {
            this.currentShopTurn = 2;
            this.updateTurnUI();
        } else {
            document.getElementById('shopModal').style.display = 'none';
            console.log("Cả hai đã chọn xong, game tiếp tục!");
            GameController.isAnimating = false;
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

    // DOUBLE_CAPTURE mới cần bấm kích hoạt
    if (cardId === 'DOUBLE_CAPTURE') {
        miniCard.innerHTML = `
            <div class="mini-card-tooltip">
                <div class="tooltip-title">${cardInfo.name}</div>
                <div class="tooltip-desc">${cardInfo.description}</div>
                <div class="tooltip-desc"><b>Bấm để kích hoạt</b></div>
            </div>
        `;

        miniCard.onclick = () => {
            ShopController.useCard(playerId, cardId, miniCard);
        };
    }
    // BONUS_SEED chỉ hiển thị trong khay như code cũ, không click dùng
    else {
        miniCard.innerHTML = `
            <div class="mini-card-tooltip">
                <div class="tooltip-title">${cardInfo.name}</div>
                <div class="tooltip-desc">${cardInfo.description}</div>
            </div>
        `;
    }

        miniCard.onclick = () => {
            if (GameController.currentPlayerId !== playerId) {
                alert("Chưa tới lượt, không được xài ké thẻ của người khác!");
                return;
            }

            // DOUBLE_CAPTURE: gọi API để kích hoạt nhân đôi điểm lượt sau
            if (cardInfo.id === 'DOUBLE_CAPTURE') {
                ShopController.useCard(playerId, cardInfo.id, miniCard);
                return;
            }

            // Các thẻ cũ giữ theo code mới của nhóm
            SkillController.activateSkill(miniCard, cardInfo.id, "Nhân phẩm bùng nổ!!!");
        };

        tray.appendChild(miniCard);
    },

    useCard: async function(playerId, cardId, miniCardElement) {
        if (cardId !== 'DOUBLE_CAPTURE') {
            return;
        }

        const confirmUse = confirm("Bạn có muốn dùng thẻ Nhân đôi điểm không?");

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

            alert("Đã kích hoạt thẻ Nhân đôi điểm! Lượt đi tiếp theo của bạn sẽ được nhân đôi điểm ăn được.");

            if (miniCardElement) {
                miniCardElement.remove();
            }

            BoardRender.renderFullState(data);

        } catch (error) {
            console.error("Lỗi khi dùng thẻ:", error);
            alert("Không thể kết nối Backend để dùng thẻ!");
        }
    },


    confirmSelection: async function() {
        const playerId = this.currentShopTurn;
        const selectedList = (playerId === 1) ? this.selectedCardsP1 : this.selectedCardsP2;

        try {
            if (selectedList.length === 0) {
                await fetch('http://localhost:8080/api/game/shop/skip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: playerId })
                });
            } else {
                for (let cId of selectedList) {
                    await fetch('http://localhost:8080/api/game/shop/buy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId: playerId, cardId: cId })
                    });

                    this.addCardToTray(playerId, cId);
                }
            }
        } catch (error) {
            console.error("Lỗi kết nối Backend lúc chốt thẻ:", error);
        }

        if (this.currentShopTurn === 1) {
            this.currentShopTurn = 2;
            this.updateTurnUI();
        } else {
            document.getElementById('shopModal').style.display = 'none';
            console.log("Cả hai đã chọn xong, game tiếp tục!");
            GameController.isAnimating = false;
        }
    }

};
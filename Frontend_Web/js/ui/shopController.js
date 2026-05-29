/**
 * @file shopController.js
 * @description Quản lý luồng giao diện Cửa hàng kỹ năng và các tương tác chọn thẻ
 */

const ShopController = {
    openShop: function(data) {
        document.getElementById('shopModal').style.display = 'flex';
        document.getElementById('shop-score-p1').innerText = data.scores.player1;
        document.getElementById('shop-score-p2').innerText = data.scores.player2;

        const p2Area = document.querySelector('#shop-area-p2 .shop-area');
        p2Area.innerHTML = '';
        if (data.p2ShopOptions) {
            data.p2ShopOptions.forEach(card => {
                p2Area.innerHTML += `
                    <div class="card-item" onclick="ShopController.selectCard(this, 2, '${card.id}')">
                        <div class="card-art-placeholder">[Hình ${card.name}]</div>
                        <p style="font-size: 0.9rem; margin-top: 5px; text-align: center;">${card.name}</p>
                        <b style="color: #a52a2a;">Giá: ${card.cost}</b>
                    </div>
                `;
            });
        }

        const p1Area = document.querySelector('#shop-area-p1 .shop-area');
        p1Area.innerHTML = '';
        if (data.p1ShopOptions) {
            data.p1ShopOptions.forEach(card => {
                p1Area.innerHTML += `
                    <div class="card-item" onclick="ShopController.selectCard(this, 1, '${card.id}')">
                        <div class="card-art-placeholder">[Hình ${card.name}]</div>
                        <p style="font-size: 0.9rem; margin-top: 5px; text-align: center;">${card.name}</p>
                        <b style="color: #a52a2a;">Giá: ${card.cost}</b>
                    </div>
                `;
            });
        }
    },

    selectCard: function(element, playerId, cardId) {
        const siblings = element.parentElement.querySelectorAll('.card-item');
        siblings.forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        console.log(`Player ${playerId} đã chọn thẻ: ${cardId}`);
    },

    reroll: function() {
        alert("Chức năng Đổi thẻ sẽ được cập nhật sau!");
    },

    confirmSelection: function() {
        document.getElementById('shopModal').style.display = 'none';
        console.log("Đã đóng Shop.");
    }
};
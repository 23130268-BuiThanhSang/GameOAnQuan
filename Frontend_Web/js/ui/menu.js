/**
 * js/ui/menu.js
 * Xử lý Menu, LocalStorage và Điều hướng
 */

const MenuController = {
    isAudioEnabled: true,

    init() {
        const savedP1 = localStorage.getItem('oanquan_p1') || "";
        const savedP2 = localStorage.getItem('oanquan_p2') || "";
        // Giữ cách check localStorage an toàn của bạn A
        this.isAudioEnabled = localStorage.getItem('oanquan_audio') !== 'false';

        document.getElementById('p1NameInput').value = savedP1;
        document.getElementById('p2NameInput').value = savedP2;

        // Giữ kiểm tra an toàn và khởi tạo AudioController của bạn A
        if (typeof AudioController !== 'undefined') {
            AudioController.init();
            AudioController.setEnabled(this.isAudioEnabled);
        }

        this.updateAudioButton();
    },

    updateAudioButton() {
        // Cập nhật cả nút ngoài Menu và nút trong Game của bạn A
        const btn = document.getElementById('btnToggleAudio');
        if (btn) {
            btn.innerText = `ÂM THANH: ${this.isAudioEnabled ? 'BẬT 🔊' : 'TẮT 🔇'}`;
        }

        const gameBtn = document.getElementById('btnToggleAudioGame');
        if (gameBtn) {
            gameBtn.innerHTML = this.isAudioEnabled
                ? '<i class="fa-solid fa-volume-high"></i>'
                : '<i class="fa-solid fa-volume-xmark"></i>';
            gameBtn.title = `ÂM THANH: ${this.isAudioEnabled ? 'BẬT' : 'TẮT'}`;
        }
    },

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);

        if (typeof AudioController !== 'undefined') {
            // Cập nhật trạng thái tổng
            AudioController.setEnabled(this.isAudioEnabled);

            // Kết hợp logic bật/tắt nhạc tức thời của bạn B
            if (this.isAudioEnabled) {
                // Kiểm tra xem đang ở Menu hay trong Game để bật đúng nhạc
                const gameScreen = document.getElementById('game-screen');
                const isInGame = gameScreen && gameScreen.style.display === 'flex';
                AudioController.playBgm(isInGame ? "battle" : "menu");
            } else {
                if (AudioController.currentBgm) {
                    AudioController.currentBgm.pause();
                }
            }
        }

        this.updateAudioButton();
    },

    startGame() {
        // Logic bật nhạc battle của bạn B (đã bọc thêm check an toàn)
        if (this.isAudioEnabled && typeof AudioController !== 'undefined') {
            AudioController.playBgm("battle");
        }

        const p1Name = document.getElementById('p1NameInput').value.trim() || "Player 1";
        const p2Name = document.getElementById('p2NameInput').value.trim() || "Player 2";

        localStorage.setItem('oanquan_p1', p1Name);
        localStorage.setItem('oanquan_p2', p2Name);

        const p1Box = document.querySelector('#tray-p1 .avatar-box');
        const p2Box = document.querySelector('#tray-p2 .avatar-box');
        if(p1Box) p1Box.innerText = p1Name.substring(0, 8);
        if(p2Box) p2Box.innerText = p2Name.substring(0, 8);

        const menu = document.getElementById('menu-screen');
        const game = document.getElementById('game-screen');

        menu.style.opacity = '0';
        setTimeout(() => {
            menu.style.display = 'none';
            game.style.display = 'flex';
            game.offsetHeight;
            game.style.opacity = '1';
        }, 800);
    },

    backToMenu() {
        if(!confirm("Bạn muốn thoát ra Menu chính?")) return;

        // Logic đổi về nhạc menu của bạn B (đã bọc thêm check an toàn)
        if (this.isAudioEnabled && typeof AudioController !== 'undefined') {
            AudioController.playBgm("menu");
        }

        const menu = document.getElementById('menu-screen');
        const game = document.getElementById('game-screen');

        game.style.opacity = '0';
        setTimeout(() => {
            game.style.display = 'none';
            menu.style.display = 'block';
            menu.offsetHeight;
            menu.style.opacity = '1';
        }, 800);
    },

    showRules() {
        document.getElementById('rulesModal').style.display = 'flex';
    },

    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }
};

document.addEventListener("DOMContentLoaded", () => MenuController.init());
/**
 * js/ui/menu.js
 * Xử lý Menu, LocalStorage và Điều hướng
 */

const MenuController = {
    isAudioEnabled: true,

    init() {
        const savedP1 = localStorage.getItem('oanquan_p1') || "";
        const savedP2 = localStorage.getItem('oanquan_p2') || "";
        this.isAudioEnabled = localStorage.getItem('oanquan_audio') !== 'false';

        document.getElementById('p1NameInput').value = savedP1;
        document.getElementById('p2NameInput').value = savedP2;
        this.updateAudioButton();
    },

    updateAudioButton() {
        const btn = document.getElementById('btnToggleAudio');
        btn.innerText = `ÂM THANH: ${this.isAudioEnabled ? 'BẬT 🔊' : 'TẮT 🔇'}`;
    },

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);
        this.updateAudioButton();
    },

    startGame() {
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
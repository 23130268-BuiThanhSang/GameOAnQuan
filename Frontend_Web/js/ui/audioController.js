/**
 * js/ui/audioController.js
 * Quản lý toàn bộ hiệu ứng âm thanh và nhạc nền
 */
let AudioController = {
    sounds: {
        drop: new Audio('./assets/sounds/drop.mp3'),
        capture: new Audio('./assets/sounds/pickup.mp3'),
        gameOver: new Audio('./assets/sounds/win.wav')
    },
    bgm: {
        menu: new Audio('./assets/sounds/background.mp3'),
        battle: new Audio('./assets/sounds/battle.mp3')
    },

    isAudioEnabled: true,
    currentBgm: null,

    init() {
        const saved = localStorage.getItem('oanquan_audio');
        this.isAudioEnabled = saved !== 'false';
        Object.values(this.sounds).forEach(s => {
            s.volume = 0.05;
            s.preload = 'auto';
        });

        Object.values(this.bgm).forEach(b => {
            b.loop = true;
            b.volume = 0.4;
            b.preload = 'auto';
        });
    },

    play(effectName) {
        this.isAudioEnabled = localStorage.getItem('oanquan_audio') !== 'false';
        if (!this.isAudioEnabled) return;

        const sound = this.sounds[effectName];
        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(err => {
            console.warn('Không phát được âm thanh:', err);
        });
    },

    playBgm(type) {
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }

        this.currentBgm = this.bgm[type];
        if (this.isAudioEnabled && this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.warn("BGM bị trình duyệt chặn phát tự động:", e);
            });
        }
    },

    toggle() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);

        if (!this.isAudioEnabled && this.currentBgm) {
            this.currentBgm.pause();
        }

        return this.isAudioEnabled;
    },

    setEnabled(enabled) {
        this.isAudioEnabled = enabled;
        localStorage.setItem('oanquan_audio', enabled);
        if (!enabled && this.currentBgm) {
            this.currentBgm.pause();
        }
    }
};

window.AudioController = AudioController;
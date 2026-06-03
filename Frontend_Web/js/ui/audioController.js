/**
 * js/ui/audioController.js
 * Quản lý toàn bộ hiệu ứng âm thanh và nhạc nền
 */
const AudioController = {
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
        // Giữ logic check an toàn từ localStorage của bạn A
        const saved = localStorage.getItem('oanquan_audio');
        this.isAudioEnabled = saved !== 'false';

        // Setup âm lượng cho hiệu ứng (dùng mức 0.05 nhẹ nhàng của bạn B để không làm chói tai)
        Object.values(this.sounds).forEach(s => {
            s.volume = 0.05;
            s.preload = 'auto';
        });

        // Setup cho nhạc nền của bạn B
        Object.values(this.bgm).forEach(b => {
            b.loop = true;
            b.volume = 0.4;
            b.preload = 'auto';
        });
    },

    play(effectName) {
        // Cập nhật trạng thái liên tục giống bạn A
        this.isAudioEnabled = localStorage.getItem('oanquan_audio') !== 'false';

        // Check an toàn: chặn phát tiếng nếu đang tắt loa
        if (!this.isAudioEnabled) return;

        const sound = this.sounds[effectName];
        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(err => {
            console.warn('Không phát được âm thanh:', err);
        });
    },

    playBgm(type) {
        // Dừng bài nhạc cũ trước khi chuyển bài mới (logic của bạn B)
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }

        // Gán bài mới
        this.currentBgm = this.bgm[type];

        // Check an toàn từ bạn A: Chỉ phát nhạc nền nếu chưa bị tắt loa
        if (this.isAudioEnabled && this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.warn("BGM bị trình duyệt chặn phát tự động:", e);
            });
        }
    },

    toggle() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);

        // Cải tiến: Tắt nhạc nền ngay lập tức khi toggle sang trạng thái Tắt
        if (!this.isAudioEnabled && this.currentBgm) {
            this.currentBgm.pause();
        }

        return this.isAudioEnabled;
    },

    setEnabled(enabled) {
        this.isAudioEnabled = enabled;
        localStorage.setItem('oanquan_audio', enabled);

        // Cải tiến: Tắt nhạc nền ngay lập tức nếu bị set thành false
        if (!enabled && this.currentBgm) {
            this.currentBgm.pause();
        }
    }
};

window.AudioController = AudioController;
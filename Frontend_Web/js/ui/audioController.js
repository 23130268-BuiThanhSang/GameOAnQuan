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
        // 10.1.1: Hệ thống khởi tạo AudioController, đọc cấu hình isAudioEnabled từ bộ nhớ trình duyệt (localStorage)
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
        // 10.1.3a.1: Các UC khác (UC4, UC11) gửi yêu cầu phát âm thanh (SFX) thông qua hàm play(effectName)
        this.isAudioEnabled = localStorage.getItem('oanquan_audio') !== 'false';

        // 10.1.3a.2: Hệ thống kiểm tra cờ isAudioEnabled. Nếu đang Bật, tiến hành reset thời gian track và phát âm thanh
        if (!this.isAudioEnabled) return;

        const sound = this.sounds[effectName];
        if (!sound) return;

        sound.currentTime = 0;

        // 10.1.3a.3: Bắt lỗi (catch) tự động nếu file âm thanh không khả dụng
        sound.play().catch(err => {
            console.warn('Không phát được âm thanh:', err);
        });
    },

    playBgm(type) {
        // 10.1.2: Khi chuyển giao diện, hệ thống gọi playBgm để tạm dừng nhạc nền cũ và phát nhạc nền mới tương ứng
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }

        this.currentBgm = this.bgm[type];
        if (this.isAudioEnabled && this.currentBgm) {
            // 10.1.3: Nếu trình duyệt chặn phát nhạc tự động (Autoplay Policy), hệ thống bắt lỗi để không làm gián đoạn game
            this.currentBgm.play().catch(e => {
                console.warn("BGM bị trình duyệt chặn phát tự động:", e);
            });
        }
    },

    toggle() {
        // 10.1.2a.2 & 10.1.2a.3: Hệ thống gọi hàm toggle() để đảo ngược trạng thái isAudioEnabled và lưu cấu hình mới
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);

        // 10.1.2a.4: Nếu trạng thái mới là Tắt, hệ thống ngay lập tức tạm dừng (pause) BGM đang phát
        if (!this.isAudioEnabled && this.currentBgm) {
            this.currentBgm.pause();
        }

        return this.isAudioEnabled;
    },

    setEnabled(enabled) {
        // Hàm hỗ trợ đồng bộ trạng thái âm thanh trực tiếp từ MenuController (Utility)
        this.isAudioEnabled = enabled;
        localStorage.setItem('oanquan_audio', enabled);

        if (!enabled && this.currentBgm) {
            this.currentBgm.pause();
        }
    }
};

window.AudioController = AudioController;
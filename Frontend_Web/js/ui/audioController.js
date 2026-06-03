const AudioController = {
    sounds: {
        drop: new Audio('./assets/sounds/drop.mp3'),
        capture: new Audio('./assets/sounds/pickup.mp3'),
        gameOver: new Audio('./assets/sounds/win.wav')
    },

    isAudioEnabled: true,

    init() {

        const saved = localStorage.getItem('oanquan_audio');
        this.isAudioEnabled = saved !== 'false';

        Object.values(this.sounds).forEach(s => {
            s.volume = 0.6;
            s.preload = 'auto';
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

    toggle() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('oanquan_audio', this.isAudioEnabled);
        return this.isAudioEnabled;
    },

    setEnabled(enabled) {
            this.isAudioEnabled = enabled;
            localStorage.setItem('oanquan_audio', enabled);
        }
};
window.AudioController = AudioController;
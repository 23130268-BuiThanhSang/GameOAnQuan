export const AudioController = {
    sounds: {
        drop: new Audio('./assets/sounds/drop.mp3'),
        capture: new Audio('./assets/sounds/pickup.mp3'),
        gameOver: new Audio('./assets/sounds/win.wav')
    },

    init() {
        Object.values(this.sounds).forEach(s => {
            s.volume = 0.6;
            s.preload = 'auto';
        });
    },

    play(effectName) {
        const sound = this.sounds[effectName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn("Âm thanh bị chặn:", e));
        }
    }
};
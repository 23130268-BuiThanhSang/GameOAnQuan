    window.AudioController = {
    sounds: {
        drop: new Audio('./assets/sounds/drop.mp3'),
        capture: new Audio('./assets/sounds/pickup.mp3'),
        gameOver: new Audio('./assets/sounds/win.wav')
    },
    bgm: {
        menu: new Audio(
            'assets/sounds/background.mp3'
        ),

        battle: new Audio(
            'assets/sounds/battle.mp3'
        )
    },

    currentBgm:null,
    init() {
        Object.values(this.sounds).forEach(s => {
            s.volume = 0.05;
            s.preload = 'auto';
        });
        Object.values(this.bgm)
            .forEach(b=>{
                b.loop=true;
                b.volume=0.4;
                b.preload='auto';

            });
    },

    play(effectName) {
        const sound = this.sounds[effectName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn("Âm thanh bị chặn:", e));
        }
    },

    playBgm(type){

        if(this.currentBgm){
            this.currentBgm.pause();
            this.currentBgm.currentTime=0;
        }

        this.currentBgm =this.bgm[type];
        if (this.currentBgm) {
            this.currentBgm.loop = true;
            this.currentBgm.play().catch(e => console.warn("BGM bị trình duyệt chặn phát tự động:", e));
        }
    }


};
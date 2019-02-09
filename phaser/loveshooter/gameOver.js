class GameOver extends Phaser.Scene {
    constructor() {
        super({key: 'gameOver'});
    }

    preload() {
        // this.load.image('heartBeat', './heartBeat.png');
    }

    create() {
        this.input.on('pointerdown', function (p) {
            // 重开游戏
            this.scene.start('mainGame');
        });
    }
}
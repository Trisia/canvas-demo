class GameOver extends Phaser.Scene {
    constructor() {
        super({key: 'gameOver'});
    }

    preload() {
        // this.load.image('heartBeat', './heartBeat.png');
    }

    create() {
        this.input.once('pointerdown', function (event) {
            // 重开游戏
            this.scene.start('mainGame');
        }, this);
    }
}
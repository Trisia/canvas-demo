class GameOver extends Phaser.Scene {
    constructor() {
        super({key: 'gameOver'});
    }

    preload() {

    }

    create() {
        var heartbeatSprite = this.physics.add.sprite(config.width / 2, config.height / 2 - 300, 'heartBeat');
        // 播放动画
        heartbeatSprite.anims.play('stage1');
        heartbeatSprite.setDisplaySize(300, 300);
        // heartbeatSprite.setTint(Phaser.Display.Color.GetColor(10, 10, 10));
        this.add.text(config.width / 2, config.height / 2 - 70, '失败')
            .setFontSize(100)
            .setOrigin(0.5)
            .setColor('#ff0e15')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setStroke('#000', 16);

        this.add.text(config.width / 2, config.height / 2 + 80, '点击继续')
            .setFontSize(100)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setBackgroundColor('#0000ff');

        this.input.once('pointerdown', function (event) {
            // 重开游戏
            this.scene.start(currentScene);
        }, this);
    }
}
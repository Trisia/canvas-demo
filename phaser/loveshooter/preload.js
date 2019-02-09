class Preload extends Phaser.Scene {
    constructor() {
        super({key: 'preload'});
        // 心跳精灵
        this.heartbeatSprite = null;
    }

    preload() {
        this.load.spritesheet('heartBeat', './heartBeat.png', {frameWidth: 108, frameHeight: 100});
    }

    create() {
        thiz = this;
        this.anims.create({
            key: 'toBack'
            , frames: this.anims.generateFrameNames('heartBeat', {start: 9, end: 0})
            , frameRate: 1.5
        });
        // 加入心跳
        this.heartbeatSprite = this.physics.add.sprite(config.width / 2, config.height / 2, 'heartBeat');
        // 播放动画
        this.heartbeatSprite.anims.play('toBack');
        // 设置大小
        this.heartbeatSprite.setDisplaySize(300, 300);
        var tempSprite = this.heartbeatSprite;
        var thiz = this;
        setTimeout(function () {
            thiz.tweens.addCounter({
                from: 255,
                to: 0,
                duration: 3000,
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue());
                    tempSprite.setTint(Phaser.Display.Color.GetColor(value, value, value));
                }
            });
        }, 5 * 1000);
        setTimeout(function () {
            // TODO 加入判断是否进入教程
            thiz.scene.start('guide');

            thiz.scene.start('mainGame');
        }, 1000 * 8);

    }
}
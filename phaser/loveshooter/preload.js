class Preload extends Phaser.Scene {
    constructor() {
        super({key: 'preload'});
        // 心跳精灵
        this.heartbeatSprite = null;
    }

    preload() {
        this.load.spritesheet('heartBeat', 'assert/heartBeat.png', {frameWidth: 108, frameHeight: 100});
    }

    create() {
        this.anims.create({
            key: 'toBack'
            , frames: this.anims.generateFrameNames('heartBeat', {start: 9, end: 0})
            , frameRate: 3.7
        });
        // 加入心跳
        this.heartbeatSprite = this.physics.add.sprite(config.width / 2, config.height / 2, 'heartBeat');
        // 播放动画
        this.heartbeatSprite.anims.play('toBack');
        // 设置大小
        this.heartbeatSprite.setDisplaySize(300, 300);
        var tempSprite = this.heartbeatSprite;

        // 延迟播放褪色动画
        setTimeout(() => {
            var temp = this.tweens.addCounter({
                from: 255,
                to: 0,
                duration: 1500,
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue());
                    tempSprite.setTint(Phaser.Display.Color.GetColor(value, value, value));
                },
                onComplete: function () {
                    // 切换场景
                    this.scene.start('mainGame');
                }
            });
            // 对象绑定
            temp.scene = this.scene;
        }, 5 * 1000);
    }
}
class Heartbeat extends Phaser.Scene {
    constructor() {
        super({key: 'heartbeat'});
        // 心跳精灵
        this.heartbeatSprite = null;
    }

    preload() {
    }

    create() {
        // 加入心跳
        this.heartbeatSprite = this.physics.add.sprite(config.width / 2, config.height / 2 - 200, 'heartBeat');
        this.anims.create({
            key: 'heartbeat-b',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 8, end: 9}),
            frameRate: 3,
            repeat: -1
        });

        // 播放动画
        this.heartbeatSprite.anims.play('heartbeat-b');
        // 设置大小
        this.heartbeatSprite.setDisplaySize(300, 300);


        this.add.text(config.width / 2, config.height / 2 + 50, '生活再次充满爱与幸福')
            .setFontSize(50)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setStroke('#000', 16);

        setTimeout(() => {
            this.scene.start('endingAnim');
        }, 5 * 1000);
    }


}
class Preload extends Phaser.Scene {
    constructor() {
        super({key: 'preload'});
        // 心跳精灵
        this.heartbeatSprite = null;
    }

    preload() {
        this.load.image('enemy1', 'assert/bullet/enemy-1.png');
        this.load.image('enemy2', 'assert/bullet/enemy-2.png');
        this.load.image('enemy3', 'assert/bullet/enemy-3.png');
        this.load.image('enemy4', 'assert/bullet/enemy-4.png');
        this.load.image('m', 'assert/mushroom2.png');
        this.load.image('protectObj', 'assert/gem.png');
        this.load.image('lockon', 'assert/lockon.png');
        this.load.image('bullet', 'assert/bullet2.png');
        this.load.image('bulletHeart', 'assert/bulletHeart.png');
        this.load.spritesheet('heartBeat', 'assert/heartBeat.png', {frameWidth: 108, frameHeight: 100});
        this.load.atlas('gems', 'assert/supply/gems.png', 'assert/supply/gems.json');
        this.load.image('yellow', 'assert/yellow.png');
        this.load.image('red', 'assert/red.png');

    }

    create() {
        currentScene = 'preGame';

        // 初始化动画
        this.initAnim();
        // 加入心跳
        this.heartbeatSprite = this.physics.add.sprite(config.width / 2, config.height / 2 - 200, 'heartBeat');
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
                duration: 1000,
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue());
                    tempSprite.setTint(Phaser.Display.Color.GetColor(value, value, value));
                },
                onComplete: function () {
                    // 切换场景
                    this.scene.start('guide1');
                }
            });
            // 对象绑定
            temp.scene = this.scene;
        }, 4 * 1000);

        this.add.text(config.width / 2, config.height / 2 + 50, 'LOADING')
            .setFontSize(50)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setStroke('#000', 16);
    }

    /**
     * 初始化动画
     */
    initAnim() {

        this.anims.create({
            key: 'toBack'
            , frames: this.anims.generateFrameNames('heartBeat', {start: 9, end: 0})
            , frameRate: 2.5
        });

        this.anims.create({
            key: 'stage1',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 0, end: 1}),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'stage2',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 2, end: 3}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create({
            key: 'stage3',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 4, end: 5}),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'stage4',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 6, end: 7}),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'stage5',
            frames: this.anims.generateFrameNumbers('heartBeat', {start: 8, end: 9}),
            frameRate: 7,
            repeat: -1
        });
    }
}
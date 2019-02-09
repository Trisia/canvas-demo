class Guide extends Phaser.Scene {
    constructor() {
        super({key: 'guide'});
        this.currentIndex = 0;
        this.numberOfImage = 0;
    }

    preload() {
        // this.load.image('heartBeat', './heartBeat.png');
    }

    create() {

        this.input.on('pointerup', function (p) {
            if (p.x <= config.width / 2) {
                // 向前翻页
                this.currentIndex = this.currentIndex - 1 <= 0 ? 0 : this.currentIndex - 1;
            } else {
                // 向后翻页
                this.currentIndex++;
            }
        });
    }

    update() {
        if (currnetTextIndex >= this.numberOfImage) {
            this.scene.start('mainGame');
        }
        // 按照顺序播放图片
        this.add.image(config.width / 2, config.height / 2, 'Prefix-' + this.currentIndex);
    }
}
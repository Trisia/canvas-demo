/**
 * 结束动画
 */

class EndingAnim extends Phaser.Scene {
    constructor() {
        super({key: 'endingAnim'});
    }

    preload() {
        // this.load.image('end-1', 'assert/end/end-1.png');
        // this.load.image('end-2', 'assert/end/end-2.png');
        this.load.image('end-3', 'assert/end/end-3.png');
    }

    create() {
        var displayArr = [
            // new Phaser.GameObjects.Sprite(this, 0, 0, 'end-1'),
            // new Phaser.GameObjects.Sprite(this, 0, 0, 'end-2'),
            new Phaser.GameObjects.Sprite(this, 0, 0, 'end-3')
        ];
        // 创建一个自动播放的相册
        this.albumAuto = new AlbumAuto(this, displayArr, 1000, () => {
            window.location = 'letter.html';
        });
        this.albumAuto.start();
    }
}
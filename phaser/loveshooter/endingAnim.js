/**
 * 结束动画
 */

class EndingAnim extends Phaser.Scene {
    constructor() {
        super({key: 'endingAnim'});
    }

    preload() {

    }

    create() {
        var displayArr = [
            new Phaser.GameObjects.Sprite(this, 400, 300, 'p'),
            new Phaser.GameObjects.Sprite(this, 400, 300, 'm'),
            new Phaser.GameObjects.Sprite(this, 400, 300, 'h')
        ];
        // 创建一个自动播放的相册
        this.albumAuto = new AlbumAuto(this, displayArr, 3000, () => {
            // 跳转到信件
            window.location = "/letter.html";
        });
        this.albumAuto.start();
    }
}
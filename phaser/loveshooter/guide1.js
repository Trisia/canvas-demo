/**
 * 教程1
 */
class Guide1 extends Phaser.Scene {
    constructor() {
        super({key: 'guide1'});
    }

    preload() {
        // this.load.image('guide-1-0', 'assert/guide/guide-1-0.png');
        // this.load.image('guide-1-1', 'assert/guide/guide-1-1.png');
        // this.load.image('guide-1-2', 'assert/guide/guide-1-2.png');
    }

    create() {
        this.ab = new Album(this, [
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-1-0'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-1-1'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-1-2')
        ], () => {
            this.scene.start('preGame');
        });
    }
}
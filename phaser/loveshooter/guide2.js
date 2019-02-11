/**
 * 教程1
 */
class Guide2 extends Phaser.Scene {
    constructor() {
        super({key: 'guide2'});
    }

    preload() {
        this.load.image('guide-2-1', 'assert/guide/guide-2-1.png');
        this.load.image('guide-2-2', 'assert/guide/guide-2-2.png');
        this.load.image('guide-2-3', 'assert/guide/guide-2-3.png');
    }

    create() {
        this.ab = new Album(this, [
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-2-1'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-2-2'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'guide-2-3')
        ], () => {
            this.scene.start('mainGame');
        });
    }
}
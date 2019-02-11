/**
 * 教程1
 */
class Guide1 extends Phaser.Scene {
    constructor() {
        super({key: 'guide1'});
    }

    preload() {

    }

    create() {
        this.ab = new Album(this, [
            new Phaser.GameObjects.Sprite(this,0, 0, 'enemy1'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'enemy2'),
            new Phaser.GameObjects.Sprite(this,0, 0, 'enemy3')
        ], () => {
            this.scene.start('preGame');
        });
    }
}
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#fff",
    physics: {
        default: 'arcade',
        debug: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
new Phaser.Game(config);


/**
 * 发射器
 * @type {Phaser.Class}
 */
class Emitor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'm');
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

        this.shootTarget = null;
        this.setInteractive()
            .setDisplaySize(60, 60);

        this.on('pointerdown', this.shootCallBack);
        this.on('pointerup', this.clearEmitorState);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.shootTarget) {
            // 计算旋转角度
            this.rotation = Phaser.Math.Angle.Between(this.x, this.y, locking.x, locking.y) - Math.PI / 2;
        }
    }

    /**
     * 设置发射方向
     * @param shootTarget
     */
    setShootTarget(shootTarget) {
        this.shootTarget = shootTarget;
    }

    /**
     * 清除发射器状态
     * @param event
     */
    clearEmitorState(event) {
        this.clearTint();
    }

    /**
     * 发射子弹
     * @param pointer 发射的出发点
     * @param time 触发时间
     * @param lastFired 上一次开火时间
     */
    shootCallBack(pointer, time, lastFired) {
        this.setTint(0xff0000);
        // 获取可用的子弹
        var bullet = bulletGroup.get().setActive(true).setVisible(true);
        if (bullet) {
            // 发射子弹
            bullet.fire(this, locking);
        }
    }
}

/**
 * 锁定准星
 */
class Locking extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, target) {
        super(scene, config.width / 2, config.height / 2);
        // 设置素材
        this.setTexture('lockon');
        // 设置大小
        this.setDisplaySize(50, 50);

        this.target = target;
        this.setDepth(1);

        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.target) {
            return;
        }

        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 10) {
            // 达到跟踪点后停止跟踪修正速度
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;

            this.rotation += 0.05;
        } else {
            // 移动当前对象位置到制制定的坐标
            // this.rotation =  this.scene.physics.moveToObject(this, this.target, 700);
            this.scene.physics.moveToObject(this, this.target, 700);
        }

    }

    /**
     * 跟踪目标
     * @param obj
     */
    trackingTarget(obj) {
        this.target = obj;
    }

}


/**
 * 敌人
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {
// var Enemy = new Phaser.Class({
//
//     Extends: Phaser.Physics.Arcade.Sprite,

    constructor(scene) {
        // initialize: function Enemy(scene) {
        //     Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0);
        super(scene, 0, 0);
        // 设置素材
        this.setTexture('m');
        // 设置大小
        this.setDisplaySize(50, 50);

        this.target = null;
        // 追踪速度
        this.speed = 30;

        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

    }

    update(time, delta) {
        // super.preUpdate(time, delta);

        if (!this.target) {
            return;
        }

        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 10) {
            // 达到跟踪点后停止跟踪修正速度
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        } else {
            // 移动当前对象位置到制制定的坐标
            this.scene.physics.moveToObject(this, this.target, this.speed);
            // this.scene.physics.moveToObject(this, this.target, 700);
            // this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));
        }

    }

    /**
     * 跟踪目标
     * @param obj
     */
    trackingTarget(obj) {
        this.target = obj;
    }

    /**
     * 受到伤害
     */
    damage() {
        console.log(this, " Hurt")
    }

    /**
     * 攻击目标
     */
    attack() {
        this.setActive(false);
        this.setVisible(false);
        // this.disableBody(false, false);
    }

}

/**
 * 发射的子弹对象
 * @type {Phaser.Class}
 */
// var Bullet = new Phaser.Class({
class Bullet extends Phaser.GameObjects.Image {

    constructor(scene) {
        super(scene, 0, 0, 'heart');

        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setDisplaySize(30, 30);
    }

    // Fires a bullet from the player to the reticle
    fire(shooter, target) {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan((target.x - this.x) / (target.y - this.y));
        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y) {
            this.xSpeed = this.speed * Math.sin(this.direction);
            this.ySpeed = this.speed * Math.cos(this.direction);
        } else {
            this.xSpeed = -this.speed * Math.sin(this.direction);
            this.ySpeed = -this.speed * Math.cos(this.direction);
        }
        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    }

    // Updates the position of the bullet each cycle
    update(time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            // this.setActive(false);
            // this.setVisible(false);
            this.kill();
        }
    }

    /**
     * 子弹消失
     */
    kill() {
        this.setActive(false);
        this.setVisible(false);
        // this.disableBody(false, false);
    }
}

// 发射的所有子弹
var bulletGroup;

// 左右发射器
var emitorLeft;
var emitorRight;

// 目标池子
var pool;

// 敌人组
var enemyGroup;
// 敌人生成的事件
var enemyGenTimeEvent;
// 敌人生成的区域
var enemyGenerateArea;

// 瞄准准星
var locking;

function preload() {
    this.load.image('heart', '../../love/love2.png');
    this.load.image('m', '../mushroom2.png');
    this.load.image('lockon', '../lockon.png');
}

var thiz;

function create() {
    thiz = this;
    // 发射的子弹
    bulletGroup = this.physics.add.group({classType: Bullet, runChildUpdate: true});
    // 所有敌人
    enemyGroup = this.physics.add.group({classType: Enemy, runChildUpdate: true});

    // 接收子弹的池子
    pool = this.physics.add.image(config.width / 2, 70, 'm')
        .setInteractive()
        .setDisplaySize(100, 100);

    // 创建瞄准准星，并锁定目标
    locking = new Locking(this, pool);

    // this.input.on('pointermove', function (p) {
    //     locking.trackingTarget(p);
    // });

    // 初始化发射器
    emitorLeft = new Emitor(this, 30, 600 - 30);
    emitorRight = new Emitor(this, 800 - 30, 600 - 30);
    emitorLeft.setShootTarget(locking);
    emitorRight.setShootTarget(locking);

    // 敌人生成的区域
    enemyGenerateArea = new Phaser.Geom.Rectangle(0, config.height * 0.25, config.width, config.height * 0.5);
    // 定时生成敌人
    enemyGenTimeEvent = this.time.addEvent({delay: 3000, loop: true, callback: addNewEnemy});

    /*
     * 碰撞检测
     */
    // 子弹域敌人的碰撞检测
    this.physics.add.overlap(bulletGroup, enemyGroup, hitEnemy, null, this);

    // 子弹和目标之间的检测
    this.physics.add.overlap(pool, bulletGroup, hitPool, null, this);

    // 敌人和目标之间的检测
    this.physics.add.overlap(pool, enemyGroup, enemyAttack, null, this);


}

function update() {

}

/**
 * 敌人攻击到目标
 * @param enemy 敌人
 * @param pool 目标
 */
function enemyAttack(pool, enemy) {

    if (pool.active === true && enemy.active === true) {
        // console.log(enemy);
        // 敌人攻击目标
        enemy.attack();

    }
}

/**
 * 子弹击中 目标
 * @param bullet 子弹
 * @param pool 敌人
 */
function hitPool(pool, bullet) {

    if (bullet.active === true && pool.active === true) {
        // 让子弹消失
        // pool.bom();
        // console.log(pool);
        // console.log(bullet);

        // 让子弹消失
        bullet.kill();
    }
}

/**
 * 击中敌人
 * @param bullet
 * @param enemy
 */
function hitEnemy(bullet, enemy) {
    if (bullet.active === true && enemy.active === true) {
        // 敌人受到伤害
        enemy.damage();
        // 让子弹消失
        bullet.kill();
    }
}

/**
 * 增加新的敌人
 */
function addNewEnemy() {
    var enemy = enemyGroup.get().setActive(true).setVisible(true);
    if (enemy) {
        // 在制定区域随机生成敌人
        Phaser.Actions.RandomRectangle([enemy], enemyGenerateArea);
        // 设置跟踪的目标
        enemy.trackingTarget(pool);
    }
}

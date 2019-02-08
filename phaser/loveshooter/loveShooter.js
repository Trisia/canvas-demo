var config = {
    type: Phaser.AUTO,
    width: 981,
    height: 1744,
    // width: window.innerWidth,  //* window.devicePixelRatio,
    // height: window.innerHeight,// * window.devicePixelRatio,
    backgroundColor: "#fff",
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
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


    constructor(scene) {
        super(scene, 0, 0, 'm');
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

        // 发射间隔
        this.shootInterval = 150;
        this.shootTarget = null;
        // 射击开关，true 则持续射击
        this.shootSwitch = false;
        this.setInteractive()
        // .setScale(3.5);
            .setDisplaySize(230, 230);


        // 上次开火时间
        this.lastFired = 0;

        this.on('pointerdown', function () {
            // 按下打开开关发射
            this.shootSwitch = true;
            this.shoot();
        }, this);


        this.on('pointerout', function () {
            // 抬起就停止发射
            this.shootSwitch = false;
            this.clearTint();
        }, this);
        this.on('pointerup', function () {
            // 抬起就停止发射
            this.shootSwitch = false;
            this.clearTint();
        }, this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.shootTarget) {
            // 计算旋转角度
            this.rotation = Phaser.Math.Angle.Between(this.x, this.y, locking.x, locking.y) - Math.PI / 2;
        }
        if (this.shootSwitch) {
            // 如果射击开关为打开状态，则发射子弹
            this.shoot(time);
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
     * @param time 触发时间
     */
    shoot(time) {
        if (!time || (time - this.lastFired) > this.shootInterval) {
            this.setTint(0xff0000);
            // 获取可用的子弹
            var bullet = bulletGroup.get().setActive(true).setVisible(true);
            if (bullet) {
                // 设置发射子弹的类型
                bullet.setBulletType(bulletType)
                    .setPower(bulletPower)
                    // 发射子弹
                    .fire(this, locking);
            }
            this.lastFired = time;
        } else {
            // 清除被点击的状态
            this.clearEmitorState();
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
        this.setDisplaySize(100, 100);

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

class Supply extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene);

        this.type = 0;
        this.bePicked = false;
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);
        // 设置为可交互
        this.setInteractive()
            .setDisplaySize(50, 50)
            .setDepth(3);
        // 被点击之后回到目标增强攻击力
        this.on('pointerdown', this.goEnhance);

    }

    preUpdate(time, delta) {
        this.setTexture('m');

        if (this.bePicked) {
            this.scene.physics.moveToObject(this, switchBulletButton, 750);
        }
    }

    /**
     * 增强攻击力
     */
    goEnhance() {
        this.bePicked = true;
    }

    /**
     * 设置补给类型
     * @param type
     */
    setType(type) {
        this.type = type;
    }

    kill() {
        this.setActive(false)
            .setVisible(false);
        this.type = 0;
        this.bePicked = false;
    }
}

/**
 * 敌人
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene) {
        super(scene, 0, 0);
        this.reset();
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

        // 是否捕获到子弹
        this.isCatchBullet = false;
        // 被捕获的子弹图片
        this.catchImage = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.target) {
            return;
        }

        if (this.isCatchBullet) {
            if (!this.catchImage) {
                // 如果捕获到了子弹，但是还没有子弹图片显示的从组中获取一个
                this.catchImage = beCatchedBulletGroup.get().setActive(true).setVisible(true);
                // 设置为爱的子弹
                this.catchImage.setTexture('bulletHeart');
                // 设置被捕获的子弹颜色为灰色
                // this.catchImage.setTint(0x515151);

            }
            // 设置做捕获图片坐标
            this.catchImage.setPosition(this.x, this.y).setDepth(3);
            // 捕获子弹送回目标
            this.scene.physics.moveToObject(this, pool, 700);
            return;
        }
        // 重新计算速度
        this.speed = this.hp * 10;
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
    damage(value) {
        // 减少HP
        this.hp -= value;
        // 是否需要清理收到伤害的动画
        if (this.clearDamageEvent === null) {
            this.setTint(0xff0000);
            var thiz = this;
            this.clearDamageEvent = function () {
                thiz.clearDamageEvent = null;
                // 清除动画
                thiz.clearTint();
            };
            setTimeout(this.clearDamageEvent, 100);
        }
        if (this.hp <= 0) {
            this.kill();

            if (Math.random() < 0.20) {
                // 死亡时候掉落补给
                supplyGroup.get().setActive(true).setVisible(true)
                    .setPosition(this.x, this.y);
            }
        }
    }

    reset() {
        // 重置送回
        this.isCatchBullet = false;

        // 清除捕获的子弹
        if (this.catchImage) {
            this.catchImage.setActive(false).setVisible(false);
            this.catchImage = null;
        }

        // 设置素材
        this.setTexture('m');
        // 设置大小
        this.setDisplaySize(100, 100);
        // 生命值
        this.hp = 10;

        this.target = null;
        // 追踪速度
        this.speed = this.hp * 10;
        this.clearDamageEvent = null;
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.reset();
    }

    /**
     * 攻击目标
     */
    attack() {
        this.kill();
        // this.disableBody(false, false);
    }

    /**
     * 捕获能量目标
     */
    catchBullet() {
        this.isCatchBullet = true;
    }

}

/**
 * 发射的子弹对象
 * @type {Phaser.Class}
 */
class Bullet extends Phaser.GameObjects.Image {

    constructor(scene) {
        super(scene, 0, 0, 'bullet');
        // 初始化
        this.init();
    }

    /**
     * 设置子弹类型
     */
    setBulletType(type) {
        this.bulletType = type;
        return this;
    }

    // Fires a bullet from the player to the reticle
    fire(shooter, target) {
        switch (this.bulletType) {
            case 0:
                this.setTexture('bullet');
                break;
            case 1:
                this.setTexture('bulletHeart');
                break;
        }

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
        super.update(time, delta);
        // 根据子弹威力选择不同颜色子弹渲染
        switch (this.power) {
            case 1:
                // 普通子弹清除特效
                this.clearTint();
                break;
            case 2:
                this.setTint(0x07faff);
                break;
            case 3:
                this.setTint(0x53ff06);
                break;
            case 4:
                this.setTint(0xfeff06);
                break;
            case 5:
                this.setTint(0xff0e15);
                break;
        }
        // console.log(this.power);
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.kill();
        }
    }

    /**
     * 设置子弹速度
     * @param speed 子弹速度
     */
    setSpeed(speed) {
        this.speed = speed || 1;
        return this;
    }

    init() {
        this.bulletType = 0;
        this.setDepth(2);
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        // this.setScale(1.2);
        this.setDisplaySize(40, 60);
        // 子弹的攻击力
        this.power = 1;

    }

    /**
     * 设置子弹的攻击力
     * @param power
     */
    setPower(power) {
        this.power = power;
        return this;
    }

    /**
     * 子弹消失
     */
    kill() {
        this.setActive(false);
        this.setVisible(false);
    }
}

// 发射的所有子弹
var bulletGroup;

// 左右发射器
var emitorLeft;
var emitorRight;

// 目标池子
var pool;

// 被劫持的子弹
var beCatchedBulletGroup;

// 敌人组
var enemyGroup;
// 敌人生成的事件
var enemyGenTimeEvent;
// 敌人生成的区域
var enemyGenerateArea;
// 补给品组
var supplyGroup;

// 瞄准准星
var locking;

// 切换开关
var switchBulletButton;

// 发射的子弹类型
var bulletType = 0;
// 子弹的威力
var bulletPower = 1;

function preload() {
    this.load.image('m', '../mushroom2.png');
    this.load.image('lockon', '../lockon.png');
    this.load.image('bullet', '../bullet2.png');
    this.load.image('bulletHeart', '../bulletHeart.png');
}

function create() {
    thiz = this;
    // 发射的子弹
    bulletGroup = this.physics.add.group({classType: Bullet, runChildUpdate: true});
    // 所有敌人
    enemyGroup = this.physics.add.group({classType: Enemy, runChildUpdate: true});
    // 捕获的子弹组
    beCatchedBulletGroup = this.physics.add.group({classType: Phaser.GameObjects.Image, runChildUpdate: true});

    // 补给品
    supplyGroup = this.physics.add.group({classType: Supply, runChildUpdate: true});


    // 接收子弹的池子
    pool = this.physics.add.image(config.width / 2, 70, 'm')
        .setInteractive()
        .setDisplaySize(400, 400);
    pool.hp = 20;

    // 创建瞄准准星，并锁定目标
    locking = new Locking(this);

    // 初始化发射器
    emitorLeft = new Emitor(this);
    emitorLeft.setPosition(emitorLeft.width / 2 + 40, config.height - emitorLeft.height / 2 - 40);
    emitorRight = new Emitor(this);
    emitorRight.setPosition(config.width - emitorRight.width / 2 - 40, config.height - emitorRight.height / 2 - 40);
    emitorLeft.setShootTarget(locking);
    emitorRight.setShootTarget(locking);


    switchBulletButton = this.physics.add.image(config.width / 2, config.height - 100, 'm')
        .setInteractive()
        .setDisplaySize(200, 200);
    switchBulletButton.on('pointerdown', function () {
        this.setTint(0xff0000);
        bulletType = (bulletType + 1) % 2;
    });
    switchBulletButton.on('pointerup', function () {
        this.clearTint();
    });


    // 敌人生成的区域
    enemyGenerateArea = new Phaser.Geom.Rectangle(0, 0, config.width, config.height * 0.5);
    // 定时生成敌人
    enemyGenTimeEvent = this.time.addEvent({
        delay: 3000,
        callbackScope: this,
        loop: true,
        callback: addNewEnemy,
    });

    /*
     * 碰撞检测
     */
    // 子弹域敌人的碰撞检测
    this.physics.add.overlap(bulletGroup, enemyGroup, hitEnemy, null, this);
    // 子弹和目标之间的检测
    this.physics.add.overlap(pool, bulletGroup, hitPool, null, this);
    // 敌人和目标之间的检测
    this.physics.add.overlap(switchBulletButton, enemyGroup, enemyAttack, null, this);
    // 敌人和目标的检测
    this.physics.add.overlap(pool, enemyGroup, sendBackEnerage, null, this);

    this.physics.add.overlap(supplyGroup, switchBulletButton, chargePool, null, this);

}

function update(time, delta) {
    // emitorLeft.shoot(time);
    // emitorRight.shoot(time);

    autoLocking();
}

/**
 * 补充目标的能量
 * @param self
 * @param supply
 */
function chargePool(self, supply) {
    // 增加补给能力
    if (self.active === true && supply.active === true) {
        supply.kill();
        bulletPower++;
    }
}

/**
 * 发送返还目标
 * @param target
 * @param enemy
 */
function sendBackEnerage(target, enemy) {
    if (target.active === true && enemy.active === true) {
        if (enemy.isCatchBullet) {
            enemy.kill();
        }
    }
}

/**
 * 自动锁定
 *
 * 锁定距离最近的敌人
 */
function autoLocking() {
    var attackTarget = null;
    var shortDist = -1;
    // 遍历每一个可能存在的敌人
    enemyGroup.children.iterate(function (child) {
        if (child.active === false) {
            // 如果但前的目标不可见则不做计算
            return;
        }
        // 计算目标与敌人之间的距离
        var distance = Phaser.Math.Distance.Between(switchBulletButton.x, switchBulletButton.y, child.x, child.y);

        if (shortDist === -1) {
            attackTarget = child;
            // 设置最短距离
            shortDist = distance;
        } else if (distance < shortDist) {
            shortDist = distance;
            attackTarget = child;
        }
    });

    if (attackTarget === null) {
        // 如果仍然没有敌人，则攻击目标
        attackTarget = pool;
    }
    // 判断敌人是否有速度
    if (attackTarget.body.velocity) {
        // 如果存在速度，那么则需要预判射击
        attackTarget = {
            x: attackTarget.x + attackTarget.body.velocity.x * 0.5,
            y: attackTarget.y + attackTarget.body.velocity.y * 0.5
        };
    }
    // 设置锁定目标

    locking.trackingTarget(attackTarget);

}

/**
 * 敌人攻击到目标
 * @param enemy 敌人
 * @param protectTarget 目标
 */
function enemyAttack(protectTarget, enemy) {
    if (protectTarget.active === true && enemy.active === true) {

        protectTarget.setTint(0xff0000);
        setTimeout(function () {
            protectTarget.clearTint();
        }, 100);
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

        if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 30) {
            bullet.kill();

            if (bullet.bulletType === 1) {
                // 子弹类型为 能量，激活截获到自担
                enemy.catchBullet();
                return;
            }
            // 敌人受到伤害,子弹伤害
            enemy.damage(bullet.power);
            // 让子弹消失
        }
    }
}


var enemyCounter = 0;

/**
 * 增加新的敌人
 */
function addNewEnemy() {
    enemyCounter++;
    if (enemyCounter >= 7) {
        enemyCounter = 0;
        enemyGenTimeEvent.paused = true;
        setTimeout(function () {
            enemyGenTimeEvent.paused = false;
            enemyGenTimeEvent.delay = enemyGenTimeEvent.delay * 0.85;
        }, 1000 * 7)
    }
    var enemy = enemyGroup.get().setActive(true).setVisible(true);
    if (enemy) {
        // 在制定区域随机生成敌人
        Phaser.Actions.RandomRectangle([enemy], enemyGenerateArea);

        // 设置跟踪的目标
        enemy.trackingTarget(switchBulletButton);
    }
}

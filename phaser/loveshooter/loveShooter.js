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
            this.scene.physics.moveToObject(this, this.target, 850);
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
 * 补给
 */
class Supply extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene);
        this.setTexture('gems');

        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);
        // 设置为可交互
        this.setInteractive()
            .setDisplaySize(100, 100)
            .setDepth(3);
        this.init();


        // 创建动画
        scene.anims.create({
            key: 'diamond',
            frames: scene.anims.generateFrameNames('gems', {prefix: 'diamond_', end: 15, zeroPad: 4}),
            repeat: -1
        });
        scene.anims.create({
            key: 'ruby',
            frames: scene.anims.generateFrameNames('gems', {prefix: 'ruby_', end: 6, zeroPad: 4}),
            repeat: -1
        });


        // 被点击之后回到目标增强攻击力
        this.on('pointerdown', this.goEnhance);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.born += delta;
        if (this.isPick === false && this.born > 3000) {
            this.kill();
        }
    }

    /**
     * 补给
     */
    goEnhance() {
        // 点击之后进行补给
        this.isPick = true;
        this.scene.physics.moveToObject(this, beProtectedObj, 750);
    }

    /**
     * 设置补给类型
     * @param type
     */
    rangeType(type) {
        this.type = Phaser.Math.Between(0, 1);
        if (this.type === 0) {
            this.anims.play('diamond')
        } else {
            this.anims.play('ruby')
        }
        return this;
    }

    kill() {
        this.setActive(false)
            .setVisible(false);
        this.init();
    }

    init() {
        // 补给类型
        this.type = 0;
        // 诞生时间
        this.born = 0;
        this.isPick = false;
        // 重置速度
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
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
                this.catchImage.setTexture('bulletHeart')
                    .setDisplaySize(70, 70);
                // 设置被捕获的子弹颜色为灰色
                this.catchImage.setTint(0x000000);
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

            if (Math.random() > 0.30) {
                // 死亡时候掉落补给
                supplyGroup.get()
                    .setActive(true)
                    .setVisible(true)
                    .setPosition(this.x, this.y)
                    .rangeType();
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
                this.setTint(0x0a5fff);
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

/**
 * 玩家攻击的目标对象
 */
class Pool extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'heartBeat');
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);
        // 初始化动画
        this.initAnim(scene);

        // 生命值
        this.hp = 120;
        this.setInteractive()
            .setDisplaySize(300, 300);
    }

    /**
     * 初始化动画
     * @param scene 环境
     */
    initAnim(scene) {
        scene.anims.create({
            key: 'stage1',
            frames: scene.anims.generateFrameNumbers('heartBeat', {start: 0, end: 1}),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'stage2',
            frames: scene.anims.generateFrameNumbers('heartBeat', {start: 2, end: 3}),
            frameRate: 2,
            repeat: -1
        });

        scene.anims.create({
            key: 'stage3',
            frames: scene.anims.generateFrameNumbers('heartBeat', {start: 4, end: 5}),
            frameRate: 3,
            repeat: -1
        });

        scene.anims.create({
            key: 'stage4',
            frames: scene.anims.generateFrameNumbers('heartBeat', {start: 6, end: 7}),
            frameRate: 5,
            repeat: -1
        });
        scene.anims.create({
            key: 'stage5',
            frames: scene.anims.generateFrameNumbers('heartBeat', {start: 8, end: 9}),
            frameRate: 7,
            repeat: -1
        });
    }

    /**
     * 增加HP
     * @param hp 需要增加的HP
     */
    addHp(hp) {
        this.hp += hp;
    }

    /**
     * 切换播放动画
     */
    stagePlay() {
        if (this.hp >= 100) {
            this.anims.play('stage1', true);
        } else if (this.hp >= 80) {
            this.anims.play('stage2', true);
        } else if (this.hp >= 60) {
            this.anims.play('stage3', true);
        } else if (this.hp >= 40) {
            this.anims.play('stage4', true);
        } else if (this.hp >= 20) {
            this.anims.play('stage5', true);
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // 切换播放动画
        this.stagePlay();
    }

    /**
     * 是否还存活
     * @returns {boolean}
     */
    isAlive() {
        return this.hp >= 0;
    }
}

/**
 * 被保护的对象
 */
class ProtectObj extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'protectObj');
        // 生命值
        this.hp = 10;
        // 加入播放列表
        scene.add.updateList.add(this);
        scene.add.displayList.add(this);
        // 允许物理效果
        scene.physics.world.enableBody(this);

        // 预加载的子弹图片
        this.bullentImg = this.scene.add.image(this.x, this.y, 'bullet')
            .setScale(4).setActive(true).setVisible(true);
        this.heartImg = this.scene.add.image(this.x, this.y, 'bulletHeart')
            .setScale(4).setActive(false).setVisible(false);

        this.setInteractive()
            .setDisplaySize(400, 180);
        // TODO 改变颜色
        this.on('pointerdown', function () {
            this.setTint(0xff0000);
            bulletType = (bulletType + 1) % 2;
            // 切换子弹显示效果
            this.swichBulletImg();
        });
        this.on('pointerup', function () {
            this.clearTint();
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.hp = this.hp < 0 ? 0 : this.hp;
        this.hp = this.hp > 10 ? 10 : this.hp;
        // 根据HP 设置不透明度
        this.setAlpha((this.hp + 1) / (11.0));

        // 设置子弹颜色
        switch (bulletPower) {
            case 1:
                // 普通子弹清除特效
                this.bullentImg.clearTint();
                break;
            case 2:
                this.bullentImg.setTint(0x07faff);
                break;
            case 3:
                this.bullentImg.setTint(0x0a5fff);
                break;
            case 4:
                this.bullentImg.setTint(0xfeff06);
                break;
            case 5:
                this.bullentImg.setTint(0xff0e15);
                break;
        }

    }

    /**
     * 切换显示的子弹效果
     */
    swichBulletImg() {
        if (this.bullentImg.active === true) {
            this.bullentImg.setActive(false).setVisible(false);
            this.heartImg.setActive(true).setVisible(true);

        } else {
            this.bullentImg.setActive(true).setVisible(true);
            this.heartImg.setActive(false).setVisible(false);
        }
    }

    /**
     * 是否还存活
     * @returns {boolean}
     */
    isAlive() {
        return this.hp >= 0;
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

// 被保护的对象
var beProtectedObj;

// 发射的子弹类型
var bulletType = 0;
// 子弹的威力
var bulletPower = 1;

// 提示文字
var hitText;

// 警告文字
var warmText;

// 敌人生成计数器
var enemyCounter = 0;

function preload() {
    this.load.image('m', '../mushroom2.png');
    this.load.image('protectObj', './gem.png');
    this.load.image('lockon', '../lockon.png');
    this.load.image('bullet', '../bullet2.png');
    this.load.image('bulletHeart', '../bulletHeart.png');
    this.load.image('supply', '../yellow_ball.png');
    this.load.spritesheet('heartBeat', '../heartBeat.png', {frameWidth: 108, frameHeight: 100});
    this.load.atlas('gems', './supply/gems.png', './supply/gems.json');
}

function create() {
    thiz = this;

    // 发射的子弹类型
    bulletType = 0;
    // 子弹的威力
    bulletPower = 1;

    // 发射的子弹
    bulletGroup = this.physics.add.group({classType: Bullet, runChildUpdate: true});
    // 所有敌人
    enemyGroup = this.physics.add.group({classType: Enemy, runChildUpdate: true});
    // 捕获的子弹组
    beCatchedBulletGroup = this.physics.add.group({classType: Phaser.GameObjects.Image, runChildUpdate: true});

    // 补给品
    supplyGroup = this.physics.add.group({classType: Supply, runChildUpdate: true});


    // 接收子弹的池子
    pool = new Pool(this, config.width / 2, 150);


    // 创建瞄准准星，并锁定目标
    locking = new Locking(this);

    // 初始化发射器
    emitorLeft = new Emitor(this);
    emitorLeft.setPosition(emitorLeft.width / 2 + 40, config.height - emitorLeft.height / 2 - 40);
    emitorRight = new Emitor(this);
    emitorRight.setPosition(config.width - emitorRight.width / 2 - 40, config.height - emitorRight.height / 2 - 40);
    emitorLeft.setShootTarget(locking);
    emitorRight.setShootTarget(locking);

    // 被保护的对象
    beProtectedObj = new ProtectObj(this, config.width / 2, config.height - 85);
    // 创建提示文字
    hitText = this.add.text(config.width / 2, config.height - 220, '', {fontSize: 50, color: '#000'});
    hitText.setOrigin(0.5)
        .setFontStyle('bold')
        .setFontFamily('Open Sans')
        .setPadding({right: 16});

    // 警告提示文字
    warmText = this.add.text(config.width / 2, config.height / 2, '敌人来袭')
        .setFontSize(90)
        .setOrigin(0.5)
        .setColor('#fff')
        .setFontStyle('bold')
        .setFontFamily('Open Sans')
        .setPadding({right: 5})
        .setBackgroundColor('#FF0000');
    // .setVisible(false);


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
    // 敌人和被保护对象之间的检测
    this.physics.add.overlap(beProtectedObj, enemyGroup, enemyAttack, null, this);
    // 敌人和目标的检测
    this.physics.add.overlap(pool, enemyGroup, sendBackEnergy, null, this);
    // 增加子弹威力
    this.physics.add.overlap(supplyGroup, beProtectedObj, chargePool, null, this);

}

function update(time, delta) {
    // emitorLeft.shoot(time);
    // emitorRight.shoot(time);

    if (!beProtectedObj.isAlive()) {
        // TODO 玩家死亡重新开始
    }
    if (!pool.isAlive()) {
        // TODO 敌人死亡游戏结束
    }

    autoLocking();

    showTipText();

}

/**
 * 提示文字
 */
function showTipText() {
// 存活敌人数目
    var numberOfEnemyAlived = 0;
    // 遍历每一个可能存在的敌人，判断是否还有敌人存活
    enemyGroup.children.iterate(function (child) {
        if (child.active === false) {
            return;
        }
        numberOfEnemyAlived++;
    });

    if (
        (numberOfEnemyAlived === 0 && bulletType === 0) ||
        (numberOfEnemyAlived !== 0 && bulletType === 1)
    ) {
        // 提示文字
        hitText.setText("点击下方切换子弹");
        hitText.setColor('#000');
    } else if (numberOfEnemyAlived !== 0) {
        hitText.setText("敌人数：" + numberOfEnemyAlived);
        hitText.setColor('#ff0e15');
    } else {
        hitText.setText("");
    }
}

/**
 * 补充目标的能量
 * @param self
 * @param supply
 */
function chargePool(self, supply) {
    // 增加补给能力
    if (self.active === true && supply.active === true && supply.isPick === true) {

        if (supply.type === 0) {
            bulletPower++;
        } else {
            beProtectedObj.hp = beProtectedObj.hp + 1;
            console.log('Add Hp:', beProtectedObj.hp);
        }
        supply.kill();
    }
}

/**
 * 发送返还目标
 * @param target
 * @param enemy
 */
function sendBackEnergy(target, enemy) {
    if (target.active === true && enemy.active === true) {
        if (enemy.isCatchBullet) {
            enemy.kill();
            // 增加目标的HP
            pool.addHp(10);
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
        var distance = Phaser.Math.Distance.Between(beProtectedObj.x, beProtectedObj.y, child.x, child.y);

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
        // 0xff0000
        protectTarget.setTint(0x000);
        setTimeout(function () {
            protectTarget.clearTint();
        }, 100);
        // 敌人攻击目标
        enemy.kill();
        // 减少生命值
        protectTarget.hp--;
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
        if (bullet.bulletType === 1) {
            // 如果是能源子弹则让hp减少
            pool.hp--;
        }
        // 非能源子弹则无视
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


/**
 * 增加新的敌人
 */
function addNewEnemy() {
    // 警告不可见
    warmText.setVisible(false);
    enemyCounter++;
    if (enemyCounter >= 7) {
        enemyCounter = 0;
        enemyGenTimeEvent.paused = true;
        setTimeout(function () {
            warmText.setVisible(true);
        }, 1000 * 5);
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
        enemy.trackingTarget(beProtectedObj);
    }
}

/**
 * 主游戏场景
 */
class MainGame extends Phaser.Scene {
    constructor() {
        super({key: 'mainGame'});
    }

    preload() {
    }

    create() {
        this.input.addPointer(2);

        // 支持掉落补给
        supplySupport = true;

        currentScene = 'mainGame';
        // 敌人生成计数器
        enemyCounter = 0;
        // 自动瞄准射击开关
        autoShoot = false;
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

        /*
         * 初始化子弹发射器
         */
        this.emitorLeft = new Emitor(this, locking, bulletGroup);
        this.emitorLeft.setPosition(this.emitorLeft.width / 2 + 40, config.height - this.emitorLeft.height / 2 - 40);
        this.emitorRight = new Emitor(this, locking, bulletGroup);
        this.emitorRight.setPosition(config.width - this.emitorRight.width / 2 - 40, config.height - this.emitorRight.height / 2 - 40);

        // 被保护的对象
        beProtectedObj = new ProtectObj(this, config.width / 2, config.height - 85);
        // 创建提示文字
        hitText = this.add.text(config.width / 2, config.height - 220, '', {fontSize: 50, color: '#000'});
        hitText.setOrigin(0.5)
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 16});

        // 警告提示文字
        warmText = this.add.text(config.width / 2, config.height / 2, '第二关')
            .setFontSize(90)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setBackgroundColor('#FF0000');
        setTimeout(function () {
            warmText.setText('敌人来袭');
        }, 1000);


        // 敌人生成的区域
        enemyGenerateArea = new Phaser.Geom.Rectangle(0, 0, config.width, config.height * 0.5);
        // 定时生成敌人
        enemyGenTimeEvent = this.time.addEvent({
            delay: 1500,
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
        this.physics.add.overlap(supplyGroup, beProtectedObj, this.charge, null, this);

    }

    update(time, delta) {
        // 是否允许自动射击
        if (autoShoot) {
            this.emitorLeft.shoot();
            this.emitorRight.shoot();
        }
        // 游戏失败
        if (!beProtectedObj.isAlive()) {
            // 到游戏重开场景
            this.scene.start('gameOver');
        }
        // 游戏结束
        if (!pool.isAlive()) {
            // 到结束动画场景
            this.scene.start('heartbeat');
        }

        // 自动锁定
        autoLocking(pool);
        // 显示提示文字
        showTipText();
    }


    /**
     * 补充目标的能量
     * @param self
     * @param supply
     */
    charge(self, supply) {
        // 增加补给能力
        if (self.active === true && supply.active === true && supply.isPick === true) {

            if (supply.type === 0) {
                bulletPower++;
            } else {
                beProtectedObj.hp = beProtectedObj.hp + 1;
                if (beProtectedObj.hp > 10) {
                    // 大于最大生命值数量，则使用自动射击
                    autoShoot = true;
                    this.emitorLeft.shootEffectSwitch();
                    this.emitorRight.shootEffectSwitch();
                    setTimeout(() => {
                        autoShoot = false;
                        // 关闭动画
                        this.emitorLeft.shootEffectSwitch();
                        this.emitorRight.shootEffectSwitch();
                    }, 3000);
                }
            }
            supply.kill();
        }
    }
}

/**
 * 主游戏场景
 */
class PreGame extends Phaser.Scene {
    constructor() {
        super({key: 'preGame'});
    }

    preload() {
    }

    create() {
        // 支持掉落补给
        supplySupport = false;

        // 敌人生成计数器
        enemyCounter = 0;
        // 自动瞄准射击开关
        autoShoot = false;
        // 发射的子弹类型
        bulletType = 0;
        // 子弹的威力
        bulletPower = 1;

        // 敌人数目统计
        this.enemyCnt = 0;
        this.ENEMY_TOTAL = 1;

        // 发射的子弹
        bulletGroup = this.physics.add.group({classType: Bullet, runChildUpdate: true});
        // 所有敌人
        enemyGroup = this.physics.add.group({classType: Enemy, runChildUpdate: true});
        // 捕获的子弹组
        beCatchedBulletGroup = this.physics.add.group({classType: Phaser.GameObjects.Image, runChildUpdate: true});

        // 补给品
        supplyGroup = this.physics.add.group({classType: Supply, runChildUpdate: true});

        // 创建瞄准准星，并锁定目标
        locking = new Locking(this);
        locking.setPosition(config.width / 2, config.height * 0.8);

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
        warmText = this.add.text(config.width / 2, config.height / 2, '第一关')
            .setFontSize(90)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setBackgroundColor('#FF0000');
        setTimeout(function () {
            warmText.setText('');
        }, 1000);


        // 敌人生成的区域
        enemyGenerateArea = new Phaser.Geom.Rectangle(0, 0, config.width, config.height * 0.5);
        // 定时生成敌人
        enemyGenTimeEvent = this.time.addEvent({
            delay: 3000,
            callbackScope: this,
            loop: true,
            callback: this.newEnemy,
        });

        /*
         * 碰撞检测
         */
        // 子弹域敌人的碰撞检测
        this.physics.add.overlap(bulletGroup, enemyGroup, hitEnemy, null, this);
        // 敌人和被保护对象之间的检测
        this.physics.add.overlap(beProtectedObj, enemyGroup, enemyAttack, null, this);

        beProtectedObj.swichBulletImg = () => {
        };

        // 结束主要游戏
        this.finshiHitText = this.add.text(config.width / 2, config.height / 2 - 80, '阶段一完成')
            .setFontSize(100)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setBackgroundColor('#0000ff')
            .setVisible(false);

        this.finshiHitText2 = this.add.text(config.width / 2, config.height / 2 + 80, '点击宝石开启下一关')
            .setFontSize(100)
            .setOrigin(0.5)
            .setColor('#fff')
            .setFontStyle('bold')
            .setFontFamily('Open Sans')
            .setPadding({right: 5})
            .setBackgroundColor('#0000ff')
            .setVisible(false);

        beProtectedObj.on('pointerup', function () {
            if (this.finshiHitText.visible) {
                // 如果提示文字可见说明可以开启下一关
                this.scene.start('guide2');
            }
        }, this);
    }


    update(time, delta) {
        bulletType = 0;

        if (!beProtectedObj.isAlive()) {
            this.scene.start('gameOver');
        }

        if (this.enemyCnt === this.ENEMY_TOTAL && this.hasEnemyAlive() === false) {
            this.finshiHitText.setVisible(true);
            this.finshiHitText2.setVisible(true);
        }
        // 自动锁定
        autoLocking({
            x: config.width / 2,
            y: config.height * 0.8
        });

    }


    /**
     * 还是否有敌人存活
     * @returns {boolean}
     */
    hasEnemyAlive() {
        var res = false;
        // 遍历每一个可能存在的敌人
        enemyGroup.children.iterate(function (child) {
            if (child.active === false) {
                // 如果但前的目标不可见则不做计算
                return;
            }
            res = true;
        });
        return res;
    }

    /**
     * 创建新的敌人
     */
    newEnemy() {
        if (this.enemyCnt === this.ENEMY_TOTAL) {
            return;
        }
        this.enemyCnt++;

        var enemy = enemyGroup.get().setActive(true).setVisible(true);
        if (enemy) {
            // 在制定区域随机生成敌人
            Phaser.Actions.RandomRectangle([enemy], enemyGenerateArea);

            // 设置跟踪的目标
            enemy.trackingTarget(beProtectedObj);
        }
    }
}


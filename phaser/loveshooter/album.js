/**
 * 相册
 */
class Album {
    /**
     * 创建相册对象
     * @param scene
     * @param imageList 图片列表
     * @param callback 放映结束后的回调
     */
    constructor(scene, imageList, callback) {
        this.scene = scene;
        this.currentIndex = 0;
        // 在播放中的图片列表
        this.displayImages = imageList;
        // 图片播放完的回调函数
        this.callback = callback;
        // 初始化
        this.init();
    }

    /**
     * 初始化放映操作
     */
    init() {
        // 遍历图片设置为可触控
        for (var i = 0; i < this.displayImages.length; i++) {
            // 加入播放列表
            this.scene.add.displayList.add(this.displayImages[i]);
            this.scene.add.updateList.add(this.displayImages[i]);

            this.displayImages[i].setInteractive()
                .setActive(true)
                .setVisible(false);
            this.scene.input.setDraggable(this.displayImages[i]);
            // 居中
            this.displayImages[i].setPosition(config.width / 2, config.height / 2);
            // 比例
            var raito = 1.0 * this.displayImages[i].width / this.displayImages[i].height;
            if (this.displayImages[i].height > config.height) {
                this.displayImages[i].setDisplaySize(parseInt(config.height * raito), config.height);
            } else if (this.displayImages[i].width > config.width) {
                this.displayImages[i].setDisplaySize(config.width, parseInt(config.width / raito),);
            }
        }

        this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            // 水平移动
            gameObject.x = dragX;
        });

        this.scene.input.on('dragend', function (pointer, gameObject) {

            // 左滑动下一页
            if (gameObject.x < (config.width / 3.0)) {
                // 如果处于最后一页则，认为需要进入完成回调
                if (this.currentIndex === this.displayImages.length - 1) {
                    this.callback && this.callback();
                    return;
                }


                this.displayImages[this.currentIndex].setVisible(false);
                this.currentIndex =
                    this.currentIndex + 1 >= this.displayImages.length ?
                        this.displayImages.length - 1 : this.currentIndex + 1;
                this.displayImages[this.currentIndex].setVisible(true);
            }
            // 右滑动上一页
            else if (gameObject.x > (2.0 / 3 * config.width)) {
                this.displayImages[this.currentIndex].setVisible(false);
                this.currentIndex = this.currentIndex - 1 <= 0 ? 0 : this.currentIndex - 1;
                this.displayImages[this.currentIndex].setVisible(true);
            }
            gameObject.x = config.width / 2;
        }, this);

        // 最后一张图片翻页
        this.displayImages[this.displayImages.length - 1].on('pointerup', this.callback, this);
        // 显示第一张
        this.displayImages[0].setVisible(true);
    }
}

/**
 * 自动放映
 */
class AlbumAuto {
    /**
     * 创建相册对象
     * @param scene
     * @param imageList 图片列表
     * @param timeInterval 时间间隔
     * @param callback 放映结束后的回调
     */
    constructor(scene, imageList, timeInterval, callback) {
        this.scene = scene;
        this.currentIndex = 0;
        // 在播放中的图片列表
        this.displayImages = imageList;
        // 图片播放完的回调函数
        this.callback = callback;
        this.timeInterval = timeInterval || 3000;
    }

    start() {
        // 加入图片
        for (var i = 0; i < this.displayImages.length; i++) {
            // 加入播放列表
            this.scene.add.displayList.add(this.displayImages[i]);
            this.scene.add.updateList.add(this.displayImages[i]);

            this.displayImages[i].setInteractive()
                .setActive(true)
                .setVisible(false);
            // 居中
            this.displayImages[i].setPosition(config.width / 2, config.height / 2);
        }
        // 定时放映
        this.displayImageEvent = this.scene.time.addEvent({
            delay: this.timeInterval,
            callbackScope: this,
            loop: true,
            callback: this.next
        });
        this.displayImages[0].setVisible(true);
    }

    /**
     * 下一页
     */
    next() {
        if (this.currentIndex === (this.displayImages.length - 1)) {
            // 放映褪色动画
            // 延迟播放褪色动画
            var temp = this.scene.tweens.addCounter({
                from: 0,
                to: 255,
                duration: 5000,
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue());
                    this.thiz.displayImages[this.thiz.currentIndex].setTint(Phaser.Display.Color.GetColor(value, value, value));
                },
                onComplete: function () {
                    // // 执行回调
                    this.thiz.callback && this.thiz.callback();
                }
            });
            // 对象绑定
            temp.thiz = this;

            // // 放映到最后一张进行回调
            // this.callback && this.callback();
            // 暂停播放
            this.displayImageEvent.paused = true;
            return;
        }


        // 隐藏上一张
        this.displayImages[this.currentIndex].setVisible(false);
        // 计算下一张
        this.currentIndex =
            this.currentIndex + 1 >= this.displayImages.length ?
                this.displayImages.length - 1 : this.currentIndex + 1;
        this.displayImages[this.currentIndex].setVisible(true);

    }
}
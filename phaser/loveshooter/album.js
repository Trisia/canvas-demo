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
            console.log(this.displayImages[i]);

            // 加入播放列表
            this.scene.add.displayList.add(this.displayImages[i]);
            this.scene.add.updateList.add(this.displayImages[i]);

            this.displayImages[i].setInteractive()
                .setActive(true)
                .setVisible(false);
            this.scene.input.setDraggable(this.displayImages[i]);
            // 居中
            this.displayImages[i].setPosition(config.width / 2, config.height / 2);
        }

        this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            // 水平移动
            gameObject.x = dragX;
        });

        this.scene.input.on('dragend', function (pointer, gameObject) {

            // 左滑动上一页
            if (gameObject.x < (config.width / 3.0)) {
                this.displayImages[this.currentIndex].setVisible(false);
                this.currentIndex = this.currentIndex - 1 <= 0 ? 0 : this.currentIndex - 1;
                this.displayImages[this.currentIndex].setVisible(true);
            }
            // 右滑动下一页
            else if (gameObject.x > (2.0 / 3 * config.width)) {
                this.displayImages[this.currentIndex].setVisible(false);
                this.currentIndex =
                    this.currentIndex + 1 >= this.displayImages.length ?
                        this.displayImages.length - 1 : this.currentIndex + 1;
                this.displayImages[this.currentIndex].setVisible(true);
            }
            gameObject.x = config.width / 2;
        }, this);

        // 最后一张图片翻页
        this.displayImages[this.displayImages.length - 1].on('pointerup', function (p) {
            // 放映完成后的回调
            this.callback && this.callback();
        }, this);
        // 显示第一张
        this.displayImages[0].setVisible(true);
    }
}
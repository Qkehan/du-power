/**
 * @file 标题
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 标题类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Title(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.wordart = null;

        this.decoration = null;

        this.element = null;

        this.init();
    }

    var proto = Title.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var wordart = game.add.image(game.width / 2, 90, 'title');
        wordart.anchor.set(0.5);
        wordart.scale.set(0.6);
        this.wordart = wordart;

        var decoration = game.add.image(0, -18, 'title-decoration');
        decoration.anchor.set(0.5);
        wordart.addChild(decoration);
        this.decoration = decoration;

        this.element = wordart;

        this.animate();
    };

    proto.animate = function () {
        this.game.add.tween(this.decoration.scale)
            .to({x: 1.08, y: 1.08}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
    };

    return Title;

});

/**
 * @file ����
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');

    /**
     * ������
     *
     * @class
     * @param {Phaser.Game} game ��Ϸ
     * @param {Object} options ������
     */
    function Alarm(game, options) {
        /**
         * ��Ϸ
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.image = null;

        this.element = null;

        this.isAlarming = false;

        this.tween = null;

        this.audio = null;

        this.init();
    }

    var proto = Alarm.prototype;

    /**
     * ��ʼ��
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var bitmap = game.add.bitmapData(game.width, game.height);
        bitmap.rect(0, 0, bitmap.width, bitmap.width, color.get('red'));

        var image = game.add.image(0, 0, bitmap);
        image.visible = false;
        image.alpha = 0.5;
        this.image = image;

        this.element = image;
    };

    proto.update = function () {
        var power = this.level.power;

        if (!this.isAlarming && power.isLow()) {
            this.alarm();
        }
        else if (this.isAlarming && !power.isLow()) {
            this.recover();
        }
    };

    proto.alarm = function () {
        var game = this.game;
        var image = this.image;

        image.visible = 1;

        this.tween = game.add.tween(this.image)
            .from({alpha: 0}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true)
            .start();
        this.audio = game.sound.play('alarm', 1, true);
        this.isAlarming = true;
    };

    proto.recover = function () {
        var image = this.image;
        image.visible = false;
        image.alpha = 0.5;

        this.tween.stop(true);
        this.audio.stop();
        this.isAlarming = false;
    };

    return Alarm;

});

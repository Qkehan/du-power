/**
 * @file 预加载
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');

    var state = {};

    /**
     * 预加载
     */
    state.preload = function () {
        this.initLoading();
        this.loadResources();
    };

    /**
     * 初始化载入画面
     */
    state.initLoading = function () {
        var game = this.game;

        var hero = game.add.sprite(game.width / 2, game.height / 2, 'hero-sleep');
        hero.anchor.set(0.5);
        var action = 'sleep';
        hero.animations.add(action);
        hero.animations.play(action, 5, true);

        var text = game.add.text(
            game.width / 2, 340,
            'SSGer 启动中...',
            {
                font: 'bold 30px ' + global.fontFamily,
                fill: color.get('electric')
            }
        );
        text.anchor.set(0.5);
    };

    /**
     * 加载资源
     *
     * @inner
     */
    state.loadResources = function () {
        this.loadAudios();
        this.loadImages();
    };

    state.loadImages = function () {
        var game = this.game;
        var path = global.imgPath;
        var suffix = global.imgSuffix;

        [
            'hero',
            'start', 'start-ring', 'title', 'title-decoration', 'button-ticket',
            'icon-back', 'icon-share', 'icon-restart',
            'success-title', 'ticket',
            'failure-title', 'progress-ring',
            'hero-label',
            'button-pause', 'button-close', 'button-back', 'button-restart',
            'charge', 'charge-double',
            'light-fly',
            'gesture', 'arrow-charge', 'arrow-current',
            'baidu'
        ].forEach(function (name) {
            game.load.image(name, path + name + suffix);
        });

        [
            // 'hero-sleep',
            'hero-up',
            'hero-fly',
            'hero-down',
            'hero-dive',
            'hero-wake',
            'hero-over'
        ].forEach(function (name) {
            game.load.spritesheet(name, path + name + suffix, 120, 212);
        });

        game.load.spritesheet('midground', path + 'midground' + suffix, 800, 272);
        game.load.spritesheet('light-ball', path + 'light-ball' + suffix, 1600, 480);
        game.load.spritesheet('light', path + 'light' + suffix, 1400, 720);

        game.load.spritesheet('flag', path + 'flag' + suffix, 186, 197);
    };

    state.loadAudios = function () {
        var game = this.game;

        [
            'bgm',
            'click',
            'wake', 'fly', 'yell',
            'charge', 'charge-double',
            'finish', 'fall',
            'alarm'
        ].forEach(function (name) {
            game.load.audio(name, [global.audioPath + name + '.mp3', global.audioPath + name + '.ogg']);
        });
    };

    /**
     * 创建
     */
    state.create = function () {
        var game = this.game;

        var bgm = game.add.audio('bgm');
        game.sound.setDecodedCallback(
            [bgm],
            function () {
                // bgm.loopFull();
            },
            this
        );

        var level = game.state.states.level;
        // menu -> level 是连贯场景，所以实际是同一 state
        game.state.start('level', true, false, level.STATUS.MENU);
    };

    return state;

});

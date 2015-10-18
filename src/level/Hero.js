/**
 * @file 主角
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MIN_Y = 100;
    var MIN_VELOCITY_X = 80;
    var MAX_VELOCITY_X = 1200;
    var MAX_VELOCITY_CACHE = 10;

    /**
     * 主角类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Hero(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.sprite = null;

        this.body = null;

        this.light = null;

        this.radius = 32;

        this.awake = false;

        this.velocityCache = [];

        this.flyingFrameCount = 0;

        this.isContactEnding = false;

        this.isFlying = false;

        this.hasReachedMinVel = false;

        this.init();
    }

    var proto = Hero.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initSprite();
        this.initBody();
        this.initLight();
        // this.configCamera();

        this.sleep();
    };

    proto.initSprite = function () {
        var game = this.game;

        var sprite = game.add.sprite(100, game.world.height - 160 - this.radius);
        sprite.scale.set(0.6);
        sprite.anchor.set(0.5);
        this.sprite = sprite;
    };

    proto.initBody = function () {
        var game = this.game;
        var sprite = this.sprite;

        game.physics.box2d.enable(sprite);

        var body = sprite.body;
        body.setCircle(this.radius);
        body.fixedRotation = true;
        this.body = body;

        // 碰撞检测
        body.setBodyContactCallback(
            this.level.terrain,
            function (heroBody, terrainBody, heroFt, terrainFt, begin) {
                this.isContactEnding = !begin;
            },
            this
        );
    };

    proto.configCamera = function () {
        var game = this.game;
        // game.camera.follow(this.sprite); // TODO: fix follow bug
        game.camera.deadzone = new Phaser.Rectangle(
            100, 60,
            0, 0
        );
    };

    proto.initLight = function () {
        var game = this.game;

        var light = game.add.image(-60, -10, 'light-fly');
        light.anchor.set(1, 0.5);
        light.alpha = 0;
        this.light = light;

        this.sprite.addChild(light);
    };

    proto.showLight = function () {
        var game = this.game;
        var light = this.light;
        var Easing = Phaser.Easing;

        var fadeIn = game.add.tween(light)
            .to({alpha: 1}, 50, Easing.Quadratic.Out);
        var fadeOut = game.add.tween(light)
            .to({alpha: 0}, 300, Easing.Quadratic.In, false, 200);
        fadeIn.chain(fadeOut).start();
    };

    /**
     * 行使动作
     *
     * @private
     * @param {string} action 动作名称
     * @param {number} fps 帧数
     * @param {boolean=} loop 是否循环, 缺省 false
     */
    proto.act = function (action, fps, loop, refresh) {
        var sprite = this.sprite;
        var key = ['hero', action].join('-');

        // 若已是当前 key, 则不重载贴图 (loadTexture 较耗内存)
        if (sprite.key === key && !refresh) {
            return;
        }
        sprite.loadTexture(key);

        // 添加/运行动画
        if (fps) {
            var animations = sprite.animations;
            !animations.getAnimation(action) && animations.add(action, null, fps, !!loop);
            animations.play(action);
        }
    };

    proto.pauseAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.stop();
    };

    proto.resumeAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.play();
    };

    proto.sleep = function () {
        this.act('sleep', 5, true);
    };

    proto.up = function () {
        this.act('up', 6, true);
    };

    proto.fly = function () {
        this.act('fly');
    };

    proto.down = function () {
        this.act('down');
    };

    /**
     * 唤醒
     *
     * @public
     */
    proto.wake = function () {
        var game = this.game;
        var timeEvents = game.time.events;

        timeEvents.add(
            200,
            function () {
                game.sound.play('wake');
                this.act('wake', 5);
            },
            this
        );

        timeEvents.add(
            1300,
            function () {
                this.body.applyForce(200, -200);
                this.awake = true;
            },
            this
        );
    };

    /**
     * 俯冲
     *
     * @public
     */
    proto.dive = function () {
        var body = this.body;
        var velocity = body.velocity;
        if (velocity.x > MIN_VELOCITY_X) {
            body.applyForce(0, 70); // TODO: 调参
        }
        this.act('dive');
    };

    proto.shutdown = function () {
        this.act('over');
    };

    proto.over = function () {
        this.act('over', 10, false, true);
    };

    /**
     * 是否醒着
     *
     * @return {boolean} 是否醒着
     */
    proto.isAwake = function () {
        return this.awake;
    };

    proto.getX = function () {
        return this.body.x;
    };

    /**
     * 更新
     */
    proto.update = function () {
        this.sprite.bringToTop(); // XXX: 可能有性能问题

        if (!this.awake) {
            return;
        }

        if (this.isContactEnding) {
            ++this.flyingFrameCount;
        }
        else {
            this.flyingFrameCount = 0;
            this.isFlying = false;
        }

        this.updateStatus();
        this.limitVelocity();
        this.updateAngle();
    };

    /**
     * 限制速度
     */
    proto.limitVelocity = function () {
        var body = this.body;
        var velocity = body.velocity;
        if (velocity.x < MIN_VELOCITY_X) {
            if (this.hasReachedMinVel) {
                velocity.x = MIN_VELOCITY_X;
            }
        }
        else {
            this.hasReachedMinVel = true;
            if (velocity.x > MAX_VELOCITY_X) {
                velocity.x = MAX_VELOCITY_X;
            }
        }

        // 进入顶部区域
        if (body.y < MIN_Y && velocity.y < 0) {
            velocity.y -= velocity.y / 10;
        }
    };

    /**
     * 更新角度
     */
    proto.updateAngle = function () {
        var velocity = this.body.velocity;
        var velocityCache = this.velocityCache;
        if (velocityCache.length >= MAX_VELOCITY_CACHE) {
            velocityCache.shift();
        }
        velocityCache.push({x: velocity.x, y: velocity.y});

        var sumVelocityX = 0;
        var sumVelocityY = 0;
        velocityCache.forEach(function (vel) {
            sumVelocityX += vel.x;
            sumVelocityY += vel.y;
        });
        var cacheLength = velocityCache.length;
        var avgVelocityX = sumVelocityX / cacheLength;
        var avgVelocityY = sumVelocityY / cacheLength;

        var pMath = Phaser.Math;
        this.body.angle = pMath.radToDeg(pMath.angleBetween(0, 0, avgVelocityX, avgVelocityY));
    };

    proto.updateStatus = function () {
        var level = this.level;
        if (level.progress === 1) {
            this.awake = false; // TODO: sleep()
            return;
        }

        var power = level.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY:
                this.awake = false;
                break;

            default:
                var body = this.body;
                var angle = body.angle;
                if (level.isTouching) {
                    this.dive();
                }
                else {
                    if (angle < 0) {
                        if (this.flyingFrameCount >= 12) {
                            var velocity = body.velocity;
                            if (!this.isFlying && velocity.y < 0) {
                                var speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
                                if (speed >= 500) {
                                    level.sound.play('fly');
                                    this.showLight();
                                    speed >= 700 && level.time.events.add(
                                        250,
                                        function () {
                                            level.sound.play('yell');
                                        }
                                    );
                                }
                            }
                            this.fly();
                            this.isFlying = true;
                        }
                        else {
                            this.up();
                        }
                    }
                    else if (angle > 0) {
                        this.down();
                    }
                }
        }
    };

    proto.goTo = function (position, duration, ease) {
        var game = this.game;
        var body = this.body;

        var rotate = game.add.tween(body)
            .to({angle: 0}, duration);

        var move = game.add.tween(body)
            .to(position, duration, ease);
        var promise = new Promise(function (resolve) {
            move.onComplete.add(resolve);
        });

        rotate.start();
        move.start();

        return promise;
    };

    proto.goToTerminal = function (terrain) {
        this.shutdown();

        var terminal = terrain.getTerminal();
        terminal.y -= this.radius;

        return this.goTo(terminal, 400, Phaser.Easing.Linear.None);
    };

    proto.fall = function (terrain) {
        this.shutdown();

        var position = terrain.getNearestPoint(this);
        position.y -= this.radius;
        var duration = Math.abs(this.body.y - position.y);

        return this.goTo(position, Math.sqrt(duration) * 20, Phaser.Easing.Quadratic.In);
    };

    proto.render = function () {
        var game = this.game;
        var velocity = this.body.velocity;
        game.debug.text('vx: ' + velocity.x.toFixed(2), 2, 34, '#fff');
        game.debug.text('vy: ' + velocity.y.toFixed(2), 2, 54, '#fff');
        game.debug.text(
            'speed: ' + Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)).toFixed(0),
            2, 134,
            '#fff'
        );
    };

    return Hero;

});

(function () {
    'use strict';
    /*global Grape*/
    var commonResources = new Grape.ResourceCollection();
    commonResources.sprite('menubg1', 'img/menubg.png');
    commonResources.sprite('menubg2', 'img/menubg.png');
    commonResources.sprite('menubg3', 'img/menubg.png');
    //commonResources.audio('asd', 'asd.wav');
    var menuResources = new Grape.ResourceCollection();
    menuResources.add(commonResources);
    menuResources.sprite('menubg', 'img/menubg.png');
    menuResources.sprite('about', 'img/about.png');
    menuResources.sprite('newgame', 'img/newgame.png');
    var gameResources = new Grape.ResourceCollection();
    gameResources.add(commonResources);
    gameResources.sprite('bg', 'img/bg.png');
    gameResources.sprite('ball', 'img/ball.png', {
        originX: 12, //ball center coords
        originY: 12
    });
    var allResource = new Grape.ResourceCollection();
    allResource.add(menuResources);
    allResource.add(gameResources);

    var LoadingScene = Grape.Scene.extend('LoadingScene', {
        init: function () {
            this.progress = 0;
        },
        'event start': function (game) {
            var that = this;
            menuResources.load(function () {
                game.startScene(new MenuScene());
            }, function () {
                alert('error while loading game');
            }, function (percent) {
                that.progress = percent;
                console.log(percent);
            });
        },
        'event render': function (ctx) {
            ctx.fillStyle = 'red';
            ctx.globalAlpha = 0.2;
            ctx.fillRect(0, 100, this.progress * 2, 20);
        }
    });

    var PongScene = Grape.Class('PongScene', Grape.Scene, {
        init: function () {
            this.width = 400;
            this.height = 300;
            this.backgroundColor = 'red';
        }
    });

    var MenuScene = Grape.Class('MenuScene', PongScene, {
        init: function () {
            this.add(new NewGameButton({
                x: 200,
                y: 100
            }));
            this.add(new AboutButton({
                x: 200,
                y: 200
            }));
        },
        'override initViews': function () {
            this.addView(new Grape.View({target: this, width: '50%'}));
            this.addView(new Grape.View({target: this, width: '50%', left: '50%'}));
        }
    });

    var GameScene = Grape.Class('GameScene', PongScene, {
        init: function () {
            this.add(new Bat({
                x: 10,
                y: 100,
                upKey: 'w',
                downKey: 's',
                backgroundColor: 'red'
            }));
            this.add(new Bat({
                x: 310,
                y: 100,
                upKey: 'up',
                downKey: 'down',
                backgroundColor: 'green'
            }));
        }
    });

    var Bat = Grape.Class('Bat', [Grape.GameObject, Grape.Position, Grape.Rectangle], {
        init: function (opts) {
            this.onGlobal('keyDown.' + opts.upKey, function () {
                if (this.y > 0) {
                    this.y -= 10;
                }
            });
            this.onGlobal('keyDown.' + opts.downKey, function () {
                if (this.y < 480) {
                    this.y += 10;
                }
            });
        }
    });

    var MenuItem = window.M = Grape.Class('MenuItem', [Grape.GameObject /*Grape.Std.Mouse, TODO Grape.Std.Position*/], {
        init: function (opts) {
            opts = opts || {};
            this.alpha = 0.6;
            this.x = opts.x || 0;
            this.y = opts.y || 0;
        },
        'event localPress.mouseLeft': function () {
            this.action();
        },
        'event mouseOver': function () {
            this.alpha = 1;
        },
        'event mouseOut': function () {
            this.alpha = 0.6;
        },
        'global-event render': function (ctx) {
            ctx.drawImage(this.sprite.img, this.x, this.y);
        },
        'abstract action': null
    });

    var NewGameButton = window.N = Grape.Class('NewGameButton', MenuItem, {
        init: function () {
            this.sprite = menuResources.get('newgame');
        },
        action: function () {
            Grape.startScene(new GameScene());
        }
    });

    var AboutButton = Grape.Class('AboutButton', MenuItem, {
        init: function () {
            this.sprite = menuResources.get('about');
        },
        action: function () {
            alert('Grape pong');
        }
    });

    var Pong = Grape.Game.extend('Pong', {

    });

    (window.P = new Pong({container: 'game'})).start(new LoadingScene());
})();
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
        }
    });

    var GameScene = Grape.Class('GameScene', PongScene, {
        init: function () {
            this.addSystem('collision', new Grape.CollisionSystem());

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
            this.add(new Ball({
                x: 160,
                y: 120,
                speedX: Math.random() < 0.5 ? 3 : -3,
                speedY: Math.random() < 0.5 ? 3 : -3
            }));
        }
    });

    var Ball = window.Ball = Grape.Class('Ball', [Grape.Rectangle, Grape.Collidable, Grape.Physical], {
        'collision Bat': function () {
            this.speedX *= -1;
        },
        init: function () {
            this.width = 32;
            this.height = 32;
            this.backgroundColor = 'black';
        },
        'global-event frame': function () {
            if (this.y <= 0 || this.y > 400) {
                this.speedY *= -1;
            }
        }
    });

    var Bat = Grape.Class('Bat', [Grape.Rectangle, Grape.Collidable], {
        init: function (opts) {
            this.width = 20;
            this.height = 100;
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
        },
        'event add': function () {
            this.addTag('Bat');
        }
    });

    var MenuItem = window.M = Grape.Class('MenuItem', [Grape.Mouse, Grape.SpriteVisualizer], {
        'event localPress.mouseLeft': function () {
            this.action();
        },
        'event mouseOver': function () {
            this.alpha = 1;
        },
        'event mouseOut': function () {
            this.alpha = 0.6;
        },
        'abstract action': null
    });

    var NewGameButton = window.N = Grape.Class('NewGameButton', MenuItem, {
        init: function () {
            this.sprite = menuResources.get('newgame');
        },
        action: function () {
            this.getGame().startScene(new GameScene());
        },
        'global-event keyDown.mouseLeft': function () {
            this.x--;
        },
        'global-event keyDown.mouseRight': function () {
            this.x++;
        },
        'global-event mouseMove': function (e) {
            this.x += e.x - e.prevX;
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

    window.P = new Pong({
        container: 'game',
        initialScene: function () {
            return new LoadingScene();
        }
    });
    P.start();
})();
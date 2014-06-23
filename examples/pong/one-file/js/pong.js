(function () {
    'use strict';
    /*global Grape*/
    //DEFINE RESOURCES
    var res = new Grape.ResourceCollection({prefix: '../'});

    //-----sounds------
    res.audio('bounce', 'audio/bounce.mp3', 'audio/bounce.ogg', 'audio/bounce.wav');
    res.audio('applause', 'audio/applause.mp3');

    //-----sprites-----
    res.sprite('menubg', 'img/menubg.png');
    res.sprite('about', 'img/about.png');
    res.sprite('newgame', 'img/newgame.png');
    res.sprite('bg', 'img/bg.png');
    res.sprite('ball', 'img/ball.png', {
        originX: 12, //ball center coords
        originY: 12
    });

    //DEFINE SCENES
    var PongScene = Grape.Class('PongScene', Grape.Scene, {
        init: function () {
            this.width = 800;
            this.height = 600;
        }
    });

    var MenuScene = Grape.Class('MenuScene', PongScene, {
        init: function () {
            this.background = res.get('menubg');
            this.add(new NewGameButton({x: 64, y: 256}));
            this.add(new AboutButton({x: 64, y: 352}));
        }
    });

    var GameScene = Grape.Class('GameScene', PongScene, {
        init: function () {
            this.background = res.get('bg');

            this.addSystem('collision', new Grape.CollisionSystem());

            this.add(new Bat({
                x: 10,
                y: 220,
                upKey: 'w',
                downKey: 's',
                backgroundColor: 'red'
            }));
            this.add(new Bat({
                x: 766,
                y: 220,
                upKey: 'up',
                downKey: 'down',
                backgroundColor: 'green'
            }));
            this.add(new Ball({
                x: 400,
                y: 300,
                speedX: Math.random() < 0.5 ? 5 : -5,
                speedY: Math.random() < 0.5 ? 5 : -5
            }));
        }
    });

    //DEFINE CLASSES
    //-----menu-----
    var MenuItem = Grape.Class('MenuItem', [Grape.Mouse, Grape.SpriteVisualizer], {
        init: function () {
            this.alpha = 0.6;
        },
        'event keyPress.mouseLeft': function () {
            this.getGame().setCursor('auto');
            this.action();
        },
        'event mouseOver': function () {
            this.getGame().setCursor('pointer');
            this.alpha = 1;
        },
        'event mouseOut': function () {
            this.getGame().setCursor('auto');
            this.alpha = 0.6;
        },
        'abstract action': null
    });

    var NewGameButton = Grape.Class('NewGameButton', MenuItem, {
        init: function () {
            this.sprite = res.get('newgame');
        },
        action: function () {
            this.getGame().startScene(new GameScene());
        }
    });

    var AboutButton = Grape.Class('AboutButton', MenuItem, {
        init: function () {
            this.sprite = res.get('about');
        },
        action: function () {
            alert('The Pong game implementation in Grape.js\n By Zoltan Mihalyi');
            this.getGame().input.resetKeys();
        }
    });

    //-----game-----
    var Ball = Grape.Class('Ball', [Grape.SpriteVisualizer, Grape.Collidable, Grape.Physical], {
        'collision BAT': function () {
            this.speedX *= -1;
            this.accelerate(0.5);
            res.get('bounce').play();
        },
        init: function () {
            this.sprite = res.get('ball');
        },
        'global-event frame': function () {
            if (this.getTop() <= 0 || this.getBottom() >= this.getScene().height) {
                this.speedY *= -1;
                res.get('bounce').play();
            }
            if (this.getLeft() <= 0) {
                this.handleEnd('Right player won!');
            }
            if (this.getRight() >= this.getScene().width) {
                this.handleEnd('Left player won!');
            }
        },
        handleEnd: function (text) {
            res.get('applause').play();
            alert(text);
            this.getGame().input.resetKeys();
            this.getGame().startScene(new MenuScene());
        }
    });

    var Bat = Grape.Class('Bat', [Grape.Rectangle, Grape.Collidable], {
        init: function (opts) {
            this.width = 24;
            this.height = 160;
            this.onGlobal('keyDown.' + opts.upKey, function () {
                if (this.y > 0) {
                    this.y -= 10;
                }
            });
            this.onGlobal('keyDown.' + opts.downKey, function () {
                if (this.y + this.height < this.getScene().height) {
                    this.y += 10;
                }
            });
        },
        'event add': function () {
            this.addTag('BAT');
        }
    });

    //START GAME
    var pong = new Grape.Game({
        container: 'game',
        reservedKeys: ['up', 'down']
    });
    res.load(function () {
        pong.start(new MenuScene());
    });
})();
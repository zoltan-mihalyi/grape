(function() {
    'use strict';
    /*global Grape*/
    var commonResources = new Grape.Std.ResourceCollection();
    //commonResources.audio('asd', 'asd.wav');
    var menuResources = new Grape.Std.ResourceCollection();
    menuResources.add(commonResources);
    menuResources.sprite('menubg', 'img/menubg.png');
    menuResources.sprite('about', 'img/about.png');
    menuResources.sprite('newgame', 'img/newgame.png');
    var gameResources = new Grape.Std.ResourceCollection();
    gameResources.add(commonResources);
    gameResources.sprite('bg', 'img/bg.png');
    gameResources.sprite('ball', 'img/ball.png', {
        originX: 12, //ball center coords
        originY: 12
    });
    var allResource = new Grape.Std.ResourceCollection();
    allResource.add(menuResources);
    allResource.add(gameResources);

    var PongScene = Grape.Class('PongScene', Grape.Std.Scene, {
        init: function() {
            this.width = 400;
            this.height = 300;
            this.backgroundColor = 'red';
        }
    });

    var MenuScene = Grape.Class('MenuScene', PongScene, {
        init: function() {
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
        init: function() {
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

    var Bat = Grape.Class('Bat', [Grape.Std.GameObject, Grape.Std.Position, Grape.Std.Rectangle], {
        init: function(opts) {
            this.onGlobal('keyDown.' + opts.upKey, function() {
                if (this.y > 0) {
                    this.y -= 10;
                }
            });
            this.onGlobal('keyDown.' + opts.downKey, function() {
                if (this.y < 480) {
                    this.y += 10;
                }
            });
        }
    });

    var MenuItem = Grape.Class('MenuItem', [Grape.Std.GameObject /*Grape.Std.Mouse*/], {
        init: function() {
            this.alpha = 0.6;
        },
        'event localPress.mouseLeft': function() {
            this.action();
        },
        'event mouseOver': function() {
            this.alpha = 1;
        },
        'event mouseOut': function() {
            this.alpha = 0.6;
        },
        'abstract action': null
    });

    var NewGameButton = Grape.Class('NewGameButton', MenuItem, {
        action: function() {
            Grape.startScene(new GameScene());
        }
    });

    var AboutButton = Grape.Class('AboutButton', MenuItem, {
        action: function() {
            alert('Grape pong');
        }
    });

    var Pong = Grape.Std.Game.extend('Pong', {
        init: function() {
            this.intervalId = null;
        },
        isRunning: function() {
            return this.intervalId !== null;
        },
        start: function() {
            var that = this;
            if (this.isRunning()) {
                throw 'already running';
            }
            this.intervalId = setInterval(function() {
                that.frame();
            }, 16);
            menuResources.load(function() {
                that.startScene(new MenuScene());
            }, function() {
                //alert('err');
            }, function(percent) {
                console.log(percent);
            });
        },
        stop: function() {

            if (!this.isRunning()) {
                throw 'not running';
            }
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        startScene: function(scene) {
            scene.game = this;
            this.scene = scene;
        },
        frame: function() {
            if (this.scene) {
                this.scene.emit('frame');
            }
        }
    });

    (window.P = new Pong()).start();
})();
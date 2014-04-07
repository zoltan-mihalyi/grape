(function () {
    'use strict';
    /*global Grape*/

    var PongScene = Grape.Class('PongScene', Grape.Std.Scene, {
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

    var Bat = Grape.Class('Bat', [Grape.Std.GameObject, Grape.Std.Position, Grape.Std.Rectangle], {
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

    var MenuItem = Grape.Class('MenuItem', [Grape.Std.GameObject /*Grape.Std.Mouse*/], {
        'abstract action': null
    });

    var NewGameButton = Grape.Class('NewGameButton', MenuItem, {
        action: function () {
            Grape.startScene(new GameScene());
        }
    });

    var Pong = Grape.Std.Game.extend('Pong', {
        init: function () {
            var that = this, rm = this.resourceManager = new Grape.Std.ResourceManager();
            rm.sprite('img/menubg.png');
            rm.sprite('img/about.png');
            rm.sprite('img/newgame.png');
            rm.sprite('img/bg.png');
            rm.sprite('img/ball.png', {
                    originX: 12, //ball center coords
                    originY: 12
                }
            );

            rm.on('complete', function () {
                that.startScene(new MenuScene());
            });

            rm.on('progress', function (percent) {
                console.log(percent)
            });

        },
        start: function () {
            this.resourceManager.loadAll();
        },
        startScene: function (scene) {
            scene.game = this;
            this.scene = scene;
        },
        frame:function(){
            this.scene.emit('frame');
        }
    });

    (window.P = new Pong()).start();
})();
(function () {
    'use strict';
    /*global Grape*/

    var MenuScene=Grape.Class('MenuScene',{
        init:function(){
            this.width=400;
            this.height=300;
            this.backgroundColor='red';
            this.add(new NewGameButton({
                x: 200,
                y: 100
            }));
        }
    });

    var MenuItem = Grape.Class('MenuItem', [/*Grape.Std.Mouse*/], {
        'abstract action': null
    });

    var NewGameButton=Grape.Class('NewGameButton', MenuItem,{
        action:function(){

        }
    });

    var LoadingScene = Grape.Std.Scene.extend({
        init: function () {
            var newGameButton = new NewGameButton();
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
                that.startScene(MenuScene);
            });

            rm.on('progress', function (percent) {
                console.log(percent)
            });

        },
        start: function () {
            this.resourceManager.loadAll();
            var menu = new MenuScene();
            this.startScene(menu);
        }
    });

    new Pong().start();
})();
define(['grape'], function(Grape) {


    var GameScene = Grape.Class('GameScene', [Grape.Scene], {
        init:function(){
            this.add(new Player({x: 32, y: 32}));
        }
    });

    var Player = Grape.Class('Player', [Grape.Collidable, Grape.Position, Grape.SpriteVisualizer], {
        init:function(){
            this.sprite=res.get('player');
        }
    });


    var Bomberman = new Grape.Game();
    Bomberman.start(new GameScene());
});
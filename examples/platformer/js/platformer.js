define(['grape'], function (Grape) {
    var res = new Grape.ResourceCollection();
    res.sprite('man', 'sprite/man.png', {
        subimages: 4
    });
    res.sprite('wall', 'sprite/wall.png');

    var LoadingScene = Grape.Scene.extend({
        'event start': function (game) {
            var that = this;
            res.load(function () {
                game.startScene(new Level1());
            }, function () {
                alert('fail');
            }, function (percent) {
                that.progress = percent;
            });
        },
        'event render': function (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 200, this.progress * this.game.getScreenWidth() / 100, 60);
        }
    });

    var Level1 = Grape.Scene.extend({
        init: function () {
            this.addSystem('collision', new Grape.CollisionSystem());
            this.add(new Man({x: 32, y: 128}));
            this.add(new Wall({x: 32, y: 256}));
            this.add(new Wall({x: 64, y: 256}));
            this.add(new Wall({x: 96, y: 256}));
            this.add(new Wall({x: 128, y: 256}));

            this.add(new Wall({x: 128, y: 192}));
            this.add(new Wall({x: 32, y: 192}));
        }
    });

    var Wall = Grape.Class('Wall', [Grape.Collidable, Grape.SpriteVisualizer], {
        init: function () {
            this.sprite = res.get('wall');
        },
        'event add':function(){
            this.addTag('Solid');
        }
    });

    var Man = Grape.Class('Man', [Grape.Physical, Grape.Collidable, Grape.SpriteVisualizer], {
        init: function () {
            this.sprite = res.get('man');
        },
        'global-event frame': function () {
            this.speedY += 0.3;
            this.subimage = this.subimage % this.sprite.subimages;
        },
        'collision Solid':  function (solid) {
            if (solid.y > this.y) {
                this.y = solid.y - this.getHeight();
            }
            this.speedY = 0;
            if (this.layer.game.input.isPressed('up')) {
                this.speedY = -6;
            }
        },
        'global-event keyDown': {
            left: function () {
                this.x -= 4;
                this.subimage += 0.5;
            },
            right: function () {
                this.x += 4;
                this.subimage += 0.5;
            }
        }
    });

    Platformer = new Grape.Game({container: 'game'});
    Platformer.start(new LoadingScene);

});
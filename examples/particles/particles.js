define(['grape'], function (Grape) {
    Fire.addColorStop;
    var Fire = Grape.Class('Fire', [Grape.Rectangle], {
        'event add': function () {
            this.emitter = this.getLayer().getSystem('particles').createEmitter({
                shape: 'ellipse',
                x: this.x,
                y: this.y + 48,
                width: 32,
                height: 16,
                rate: 2,
                duration: Infinity,
                emits: {
                    shape: 'circle',
                    radius: 2,
                    drawMode: 'add',
                    duration: [30, 60],
                    speed: [0.1, 2],
                    direction: [85, 95],
                    gravity: 0.01,
                    gravityDirection: 270,
                    color: 'red',
                    stops: [
                        {
                            offset: 10,
                            radius: [1, 5]
                        },
                        {
                            offset: 50,
                            color: 'orange'
                        },
                        {
                            offset: 100,
                            alpha: 0
                        }
                    ],
                    periods: {
                        10: {
                            accY: [-0.05, 0.05]
                        }
                    }
                }
            });
        },
        'event remove': function () {
            this.emitter.remove();
        }
    });

    var Scene = Grape.Scene.extend({
        init: function () {
            this.addSystem('particles', new Grape.ParticleSystem());
            this.add(new Fire({x: 100, y: 100}));
            this.add(new Fire({x: 200, y: 100}));
        }
    });

    new Grape.Game({container: 'game'}).start(Scene);

});
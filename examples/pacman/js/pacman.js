define(['grape'], function (Grape) {
    var res = new Grape.ResourceCollection();
    res.tile('images/pacman.png', 32, 32, {
        pacman_left: [0, 3, 4],
        pacman_right: [0, 0, 4],
        pacman_up: [0, 1, 4],
        pacman_down: [0, 2, 4]
    });
    res.sprite('wall', 'images/wall.png');

    var GameScene = Grape.Class('GameScene', [Grape.Scene], {
        init: function () {
            var i, j;
            for (i = 0; i < 20; i++) {
                for (j = 0; j < 20; j++) {
                    if (j == 0 || i == 0 || i == 19 || j == 19) {
                        this.add(new Wall({x: i * 32, y: j * 32}));
                    }
                }
            }

            this.add(new Player({x: 64, y: 64}));
            this.addSystem('collision', new Grape.CollisionSystem());
        }
    });

    var Player = Grape.Class('Player', [Grape.Collidable, Grape.SpriteVisualizer, Grape.Animation, Grape.Physical], {
        init: function () {
            this.sprite = res.get('pacman_right');
        },
        'collision SOLID': function () {
            this.x -= this.speedX;
            this.y -= this.speedY;
            this.speedX = this.speedY = 0;
        },
        'global-event frame': function () {
            this.imageSpeed = 0.5;
            if (this.speedX > 0) {
                this.sprite = res.get('pacman_right');
            } else if (this.speedX < 0) {
                this.sprite = res.get('pacman_left');
            } else if (this.speedY > 0) {
                this.sprite = res.get('pacman_down');
            } else if (this.speedY < 0) {
                this.sprite = res.get('pacman_up');
            } else {
                this.imageSpeed = 0;
            }
        },
        'global-event keyPress': {
            left: function () {
                this.speedY = 0;
                this.speedX = -4;
            },
            right: function () {
                this.speedY = 0;
                this.speedX = 4;
            },
            up: function () {
                this.speedX = 0;
                this.speedY = -4;
            },
            down: function () {
                this.speedX = 0;
                this.speedY = 4;
            }
        }
    });

    var Wall = Grape.Class('Wall', [Grape.Collidable, Grape.SpriteVisualizer], {
        init: function () {
            this.sprite = res.get('wall');
        },
        'event add': function () {
            this.addTag('SOLID');
        }
    });

    Grape.Input.setReservedKeys();

    var Pacman = window.Pacman = new Grape.Game();
    res.load(function () {
        Pacman.start(new GameScene());
    });
});
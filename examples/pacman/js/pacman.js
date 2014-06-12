define(['grape'], function (Grape) {
    var res = new Grape.ResourceCollection();
    res.tile('images/pacman.png', 32, 32, {
        pacman_left: [0, 3, 4],
        pacman_right: [0, 0, 4],
        pacman_up: [0, 1, 4],
        pacman_down: [0, 2, 4]
    });
    res.sprite('wall', 'images/wall.png');
    res.sprite('dot', 'images/dot.png');

    var typeMapping = {
        0: null
    };

    var GameScene = Grape.Class('GameScene', [Grape.Scene], {
        init: function () {
            this.addSystem('collision', new Grape.CollisionSystem());
            this.score = 0;
        }
    });

    res.scene('level1', 'scene/level1.json', {typeMapping: typeMapping, type: GameScene});


    var Pickupable = Grape.Class('Pickupable', [Grape.Collidable, Grape.SpriteVisualizer], {
        sprite:res.get('dot'),
        'event add': function () {
            this.addTag('PICKUPABLE');
        },
        'abstract pickUp': null
    });

    var Dot = typeMapping[3] = Grape.Class('Dot', Pickupable, {
        init: function () {
            this.sprite = res.get('dot');
        },
        'override pickUp': function () {
            this.getScene().score++;
        }
    });

    var Player = typeMapping[2] = Grape.Class('Player', [Grape.Collidable, Grape.Animation, Grape.Physical], {
        init: function () {
            this.sprite = res.get('pacman_right');
        },
        'collision SOLID': function () {
            this.x -= this.speedX;
            this.y -= this.speedY;
            this.speedX = this.speedY = 0;
        },
        'collision PICKUPABLE': function (pickupable) {
            pickupable.pickUp();
            pickupable.remove();
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

    var Wall = typeMapping[1] = Grape.Class('Wall', [Grape.Collidable, Grape.SpriteVisualizer], {
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
        Pacman.start(res.get('level1').create());
    });
});
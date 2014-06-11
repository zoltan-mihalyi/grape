describe('game tests', function () {
    var Grape = require('grape');
    it('test start twice', function () {
        var g = new Grape.Game();
        g.start(); //should work
        expect(function () {
            g.start();
        }).toThrow();
    });

    var GameMock = Grape.Game.extend({
        'override createGameLoop': function () {
            return {
                _game: this,
                _started: false,
                start: function () {
                    this._started = true;
                },
                stop: function () {
                    this._started = false;
                },
                isRunning: function () {
                    return this._started;
                },
                tick: function () {
                    this._game.frame();
                }
            };
        }
    });


    it('not existing containers', function () {
        var g1 = new GameMock({container: document.getElementById('notExisting')});
        var g2 = new GameMock({container: 'notExisting'});

        expect(function () {
            g1.start();
        }).toThrow();
        expect(function () {
            g2.start();
        }).toThrow();
    });

    it('restart', function () {
        var g = new GameMock();
        g.start();
        g.stop();
        g.start(); //no throw
    });

    it('start scene', function () {
        var g = new GameMock();

        expect(function () {
            g.startScene(new Grape.Scene()); //without starting the game
        }).toThrow();

        g.start(new Grape.Scene()); //initialScene is not a factory
        g.startScene(new Grape.Scene()); //now works

        expect(function () {
            g.startScene(g.getScene()); //restart same scene is not allowed
        }).toThrow();
    });

    it('from game.frame() to event frame', function () {
        var g = new GameMock();
        g.start(function () {
            var scene = new Grape.Scene();
            scene.count = 0;
            var go = new Grape.GameObject();
            go.onGlobal('frame', function () {
                scene.count++;
            });
            scene.add(go);
            return scene;
        });
        expect(g.getScene().count).toBe(0);
        g.gameLoop.tick();
        expect(g.getScene().count).toBe(1);
    });
});

describe('game loop test', function () {
    var Grape = require('grape');

    it('game loop start, stop', function () {
        var loop = new Grape.GameLoop();

        expect(loop.isRunning()).toBe(false);

        expect(function () {
            loop.stop();
        }).toThrow();

        expect(loop.isRunning()).toBe(false);

        loop.start();

        expect(loop.isRunning()).toBe(true);

        expect(function () {
            loop.start();
        }).toThrow();


        expect(loop.isRunning()).toBe(true);

        loop.stop();

        expect(loop.isRunning()).toBe(false);
    });
});

describe('game object test', function () {
    var Grape = require('grape');
    it('global-event keyword', function () {

        expect(function () {
            Grape.Class({
                'global-event x': function () {

                }
            });
        }).toThrow();

        var X = Grape.Class(Grape.GameObject, {
            init: function () {
                this.count = 0;
            },
            'global-event x': function (ev) {
                this.count++;
                this.ev = ev;
            }
        });

        var x = new X();
        var layer = new Grape.Layer();
        layer.add(x);
        layer.emit('x', 123);
        expect(x.count).toBe(1);
        expect(x.ev).toBe(123);

        x.remove();
        layer.emit('x', 123);
        expect(x.count).toBe(1);
    });

    it('onGlobal', function () {
        var g = new Grape.GameObject();
        var layer = new Grape.Layer();
        g.count = 0;
        g.onGlobal('x', function (e) { //before adding to layer
            this.count += e;
        });

        layer.add(g)

        g.onGlobal('x', function (e) { //after adding
            this.count += e * 10;
        });

        layer.emit('x', 20);
        expect(g.count).toBe(220);
        layer.emit('x', 10);
        expect(g.count).toBe(330);
        g.remove();
        layer.emit('x', 10);
        expect(g.count).toBe(330);

        g.emit('remove');

    });

    it('get layer delegates', function () {
        var g = new Grape.GameObject();
        var layer = new Grape.Layer();
        var scene = new Grape.Scene();
        var game = new Grape.Game();
        game.start(scene);
        scene.addLayer(layer);

        expect(g.getLayer()).toBe(null);
        expect(g.getScene()).toBe(null);
        expect(g.getGame()).toBe(null);

        layer.add(g);

        expect(g.getLayer()).toBe(layer);
        expect(g.getScene()).toBe(scene);
        expect(g.getGame()).toBe(game);
    });
});

describe('game object array test', function () {
    var Grape = require('grape');

    it('batch methods', function () {
        var g1 = new Grape.GameObject();
        var g2 = new Grape.GameObject();
        var g3 = new Grape.GameObject();
        var arr = new Grape.GameObjectArray();
        g1.x = 1;
        g2.x = 2;
        g3.x = 3;
        arr.push(g1);
        arr.push(g2);
        arr.push(g3);

        spyOn(g1, 'emit');
        spyOn(g2, 'emit');
        spyOn(g3, 'emit');

        arr.emit('test', 123);

        expect(g1.emit).toHaveBeenCalledWith('test', 123);
        expect(g2.emit).toHaveBeenCalledWith('test', 123);
        expect(g3.emit).toHaveBeenCalledWith('test', 123);
    });
});


//todo test array proxy methods+toArray
//todo move attr, call, etc to array
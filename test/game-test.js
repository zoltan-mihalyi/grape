describe('game tests', function () {
    var Grape = require('grape');
    it('test start twice', function () {
        var g = new Grape.Game();
        g.start(); //should work
        expect(function () {
            g.start();
        }).toThrow();
        g.stop();
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
                },
                restart: function (callback) {
                    callback();
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
        var loop = new Grape.GameLoop({
            frame: function () {
            },
            render: function () {
            },
            getRequiredFps: function () {
                return 10;
            }
        });

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

    it('game loop stop inside execution', function (done) {
        var i;
        var loop = new Grape.GameLoop({
            frame: function () {
                for (i = 0; i < 10; i++) {
                    if (i == 5) {
                        //should stop the for loop, and the batch execution. If the batch is not stopped, multiple
                        //stop() calls throw error
                        loop.stop();
                    }
                }
            },
            render: function () {
            },
            getRequiredFps: function () {
                //so waiting 50 ms should be enough, and probably multiple frames are executed in a render frame
                return 1000;
            }
        });
        loop.start();
        setTimeout(function () {
            expect(i).toBe(5);
            done();
        }, 50);
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
        game.stop();
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

describe('layer test', function () {
    var Grape = require('grape');

    var Type1 = Grape.GameObject.extend();
    var Type2 = Grape.GameObject.extend();
    var Type3 = Type2.extend();

    it('should throw exception when two element is added with the same name', function () {
        var layer = new Grape.Layer();
        var system = new Grape.System();

        layer.addSystem('s1', system);

        expect(function () {
            layer.addSystem('s1', system);
        }).toThrow();

        layer.removeSystem('s1');
        layer.addSystem('s1', system); //no throw

    });

    it('should remove object if not the key string but the object itself is passed', function () {
        var layer = new Grape.Layer();
        var system1 = new Grape.System();
        var system2 = new Grape.System();

        layer.addSystem('s', system1); //add by name
        layer.addSystem(system2); //add without name
        expect(layer.hasSystem(system1)).toBe(true);
        expect(layer.hasSystem(system2)).toBe(true);

        layer.removeSystem(system1);
        layer.removeSystem(system2);
        expect(layer.hasSystem(system1)).toBe(false);
        expect(layer.hasSystem(system2)).toBe(false);

    });

    it('should throw error when removing non existent element', function () {
        var layer = new Grape.Layer();
        var system = new Grape.System(); //do not add

        expect(function () {
            layer.removeSystem(system);
        }).toThrow();

        expect(function () {
            layer.removeSystem('s');
        }).toThrow();
    });

    it('should throw error when the instance added is not a GameObject', function () {
        var layer = new Grape.Layer();
        var NotGameObject = Grape.Class();

        expect(function () {
            layer.add({});
        }).toThrow();

        expect(function () {
            layer.add(new NotGameObject());
        }).toThrow();
    });

    it('should return all instances added when calling get()', function () {

        var layer = new Grape.Layer();
        var o0 = new Grape.GameObject();
        var o1 = new Type1();
        var o2 = new Type2();
        var o3 = new Type3();
        layer.add(o0);
        layer.add(o1);
        layer.add(o2);
        layer.add(o3);

        var result = layer.get();
        expect(result).toContain(o0);
        expect(result).toContain(o1);
        expect(result).toContain(o2);
        expect(result).toContain(o3);
    });

    it('should return instances of type when calling get(type)', function () {
        var layer = new Grape.Layer();
        var o0 = new Grape.GameObject();
        var o1 = new Type1();
        var o2 = new Type1();
        var o3 = new Type2();
        layer.add(o0);
        layer.add(o1);
        layer.add(o2);
        layer.add(o3);

        var result = layer.get(Type1);
        expect(result.length).toBe(2);
        expect(result).toContain(o1);
        expect(result).toContain(o2);
    });

    it('should return instances of types when calling get([type1, type2])', function () {
        var layer = new Grape.Layer();
        var o0 = new Grape.GameObject();
        var o1 = new Type1();
        var o2 = new Type2();
        var o3 = new Type3();
        layer.add(o0);
        layer.add(o1);
        layer.add(o2);
        layer.add(o3);

        var result = layer.get([Type1, Type2]);
        expect(result.length).toBe(2);
        expect(result).toContain(o1);
        expect(result).toContain(o2);
    });

    it('should return instances of types with descendants when calling get([type1, type2], true)', function () {
        var layer = new Grape.Layer();
        var o0 = new Grape.GameObject();
        var o1 = new Type1();
        var o2 = new Type2();
        var o3 = new Type3();
        layer.add(o0);
        layer.add(o1);
        layer.add(o2);
        layer.add(o3);

        var result = layer.get([Type1, Type2], true);
        expect(result.length).toBe(3);
        expect(result).toContain(o1);
        expect(result).toContain(o2);
        expect(result).toContain(o3);
    });

    it('should return instances of types with descendants filtering duplicates when calling get([type1, type2], true) where type1 is parent of type2', function () {
        var layer = new Grape.Layer();
        var o0 = new Grape.GameObject();
        var o1 = new Type1();
        var o2 = new Type2();
        var o3 = new Type3();
        layer.add(o0);
        layer.add(o1);
        layer.add(o2);
        layer.add(o3);

        var result = layer.get([Type2, Type3], true);
        expect(result.length).toBe(2);
        expect(result).toContain(o2);
        expect(result).toContain(o3);
    });

    it('should emit start for systems added after start', function () {
        var MySystem = Grape.System.extend({
            'event start': function () {
                this.started = true;
            }
        });
        var layer = new Grape.Layer();
        var system = new MySystem();
        layer.emit('start');
        layer.addSystem(system);

        expect(system.started).toBe(true);

    });
});
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
    //TODO
});
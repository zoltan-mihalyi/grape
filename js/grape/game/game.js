define(['class', 'env', 'etc/event-emitter', 'game/game-loop', 'game/input', 'game/scene'], function (Class, Env, EventEmitter, GameLoop, Input, Scene) {
    return Class('Game', EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            this.initialScene = opts.initialScene || function () {
                return new Scene();
            };
            /* istanbul ignore else */
            if (opts.hasOwnProperty('container')) { //null and undefined too
                this.container = opts.container;
            } else if (Env.browser) {
                this.container = document.body;
            }
            this.gameLoop = this.createGameLoop();
            /* istanbul ignore else */
            if (Env.browser) {
                this.input = new Input();
            }
        },
        createGameLoop: function () {
            return new GameLoop(this);
        },
        'final start': function (scene) {
            if (this.gameLoop.isRunning()) {
                throw 'already running';
            }

            //initialize screen
            /* istanbul ignore else */
            if (Env.browser) {
                if (typeof this.container === 'string') {
                    this.container = document.getElementById(this.container);
                }
                if (!this.container) {
                    throw 'Container does not exists!';
                }
                this._screen = document.createElement('div');
                this._screen.style.position = 'relative';
                this._screen.style.float = 'left';
                this._screen.style.width = '100%';
                this._screen.style.height = '100%';
                this._screen.style.overflow = 'hidden';
                this.container.appendChild(this._screen);
            }

            this._starting = true; //startScene can run now
            /* istanbul ignore else */
            if (this.input) {
                this.input.start(this._screen);
            }
            scene = scene || this.initialScene;
            this.startScene(typeof scene === 'function' ? scene() : scene);
            this._starting = false;
            this.gameLoop.start();
        },
        'final stop': function () {
            this.gameLoop.stop(); //todo tear down logic
            /* istanbul ignore else */
            if (this.input) {
                this.input.stop();
            }
            this.emit('stop');
        },
        startScene: function (scene) {
            if (!this._starting && !this.gameLoop.isRunning()) {
                throw new Error('Game is not running! You can game.start(scene).');
            }

            if (scene._game) {
                throw 'Scene already started!';
            }
            if (this.scene) {
                this.scene.emit('stop');
                this.scene._game = null;
            }

            scene._game = this;
            this.scene = scene;
            scene.emit('start', this);
        },
        frame: function () {
            this.emit('frame');
            this.scene.emit('frame');
            /* istanbul ignore else */
            if (this.input) {
                this.input.emitEvents(this.scene); //TODO is it wrong? ie. keyPress.none?
            }
        },
        render: function () {
            /* istanbul ignore else */
            if (Env.browser) {
                this.scene.emit('renderLayer');
            }
        },
        getScreen: function () {
            return this._screen;
        },
        getScreenWidth: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetWidth : 1;
        },
        getScreenHeight: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetHeight : 1;
        },
        setCursor: /* istanbul ignore next */ function (cursor) {
            if (!this._screen) {
                return;
            }
            this._screen.style.cursor = cursor;
        },
        getScene: function () {
            return this.scene; //todo rename to _scene
        },
        getRequiredFps: function () {
            return this.scene.fps;
        }
    });
});
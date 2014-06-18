define(['../class', '../env', '../etc/event-emitter', './game-loop', './input', './scene'], function (Class, Env, EventEmitter, GameLoop, Input, Scene) {
    /**
     * A class that represents a game. You can create and run multiple games in a single page.
     *
     * @class Grape.Game
     * @uses Grape.EventEmitter
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('Game', EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            /**
             *  The scene which starts when (re)starting the game.
             * It should be a constructor or a function returning with the scene, not an instantiated scene.
             *
             * @property initialScene
             * @type {Function}
             * @default Grape.Scene
             */
            this.initialScene = opts.initialScene || Scene;
            /* istanbul ignore else */
            if (opts.hasOwnProperty('container')) { //null and undefined too
                /**
                 * The dom element which serves as the screen of the game. The size of the container is not manipulated
                 * by the engine, therefore you should set the size of it. The engine handles when this "screen size"
                 * changes and updates the displayed views. The container can be an id of a html element or a html
                 * element itself.
                 *
                 * @property container
                 * @type {String|HTMLElement}
                 * @default document.body
                 */
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
                throw new Error('already running');
            }

            //initialize screen
            /* istanbul ignore else */
            if (Env.browser) {
                if (typeof this.container === 'string') {
                    this.container = document.getElementById(this.container);
                }
                if (!this.container) {
                    throw new Error('Container does not exists!');
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
            this.startScene(typeof scene === 'function' ? new scene() : scene);
            this._starting = false;
            this.gameLoop.start();
        },
        'final stop': function () {
            this.gameLoop.stop();
            /* istanbul ignore else */
            if (this.input) {
                this.input.stop();
            }
            /**
             * Fired when the stop() method is called.
             *
             * @event stop
             */
            this.emit('stop');
        },
        startScene: function (scene) {
            if (!this._starting && !this.gameLoop.isRunning()) {
                throw new Error('Game is not running! You can game.start(scene).');
            }

            if (scene._game) {
                throw new Error('Scene already started!');
            }
            if (this.scene) {
                /**
                 * Fired to the scene when the scene is stopped.
                 *
                 * @event stop (scene)
                 */
                this.scene.emit('stop');
                this.scene._game = null;
            }

            scene._game = this;
            this.scene = scene;
            /**
             * Emitted to the scene when started. The parameter is the game.
             *
             * @event start (scene)
             */
            scene.emit('start', this);
        },
        frame: function () {
            /**
             * Fired in each frame
             *
             * @event frame
             */
            this.emit('frame');
            /**
             * Fired to the actual scene in each frame
             *
             * @event frame (scene)
             */
            this.scene.emit('frame');
            /* istanbul ignore else */
            if (this.input) {
                this.input.emitEvents(this.scene); //TODOv2 is it wrong? ie. keyPress.none?
            }
        },
        render: function () {
            /* istanbul ignore else */
            if (Env.browser) {
                /**
                 * Fired to the current scene in each render frame
                 *
                 * @event renderLayer (scene)
                 */
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
            return this.scene; //todov2 rename to _scene
        },
        getRequiredFps: function () {
            return this.scene.fps;
        }
    });
});
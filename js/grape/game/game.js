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
        /**
         * This method is called once when the game is created. If you want to use a custom game loop for your game, you
         * can override this method.
         *
         * @method createGameLoop
         * @return {Grape.GameLoop} The game loop
         */
        createGameLoop: function () {
            return new GameLoop(this);
        },
        /**
         * Starts the game. Initializes the game screen, the input system, and the game loop.
         *
         * @method start
         * @param {Grape.Scene} [scene] Initial scene, which overrides the initialScene property.
         */
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
                this.container.innerHTML = ''; //todov2 test restart
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
        /**
         * Stops the game.
         *
         * @method stop
         */
        'final stop': function () { //TODOv2 remove screen
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
        /**
         * Starts a new scene in the game.
         *
         * @method startScene
         * @param {Scene} scene The scene
         */
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
        /**
         * Called by the game loop in each frame.
         *
         * @method frame
         */
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
        /**
         * Called by the game loop when at least one frame was executed since the last screen update.
         *
         * @method render
         */
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
        /**
         * Returns the game screen which is appended to the container.
         *
         * @method getScreen
         * @return {HTMLElement} Screen element
         */
        getScreen: function () {
            return this._screen;
        },

        /**
         * Returns the width of the screen.
         *
         * @method getScreenWidth
         * @return {Number} Width
         */
        getScreenWidth: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetWidth : 1;
        },

        /**
         * Returns the height of the screen.
         *
         * @method getScreenHeight
         * @return {Number} Height
         */
        getScreenHeight: function () {
            /* istanbul ignore next */
            return this._screen ? this._screen.offsetHeight : 1;
        },

        /**
         * Sets the cursor style for the screen.
         *
         * @method setCursor
         * @param {String} cursor new cursor style
         */
        setCursor: /* istanbul ignore next */ function (cursor) {
            if (!this._screen) {
                return;
            }
            this._screen.style.cursor = cursor;
        },
        /**
         * Returns the current scene.
         *
         * @method getScene
         * @return {Grape.Scene}
         */
        getScene: function () {
            return this.scene; //todov2 rename to _scene
        },

        /**
         * This method is called by the game loop to determine what is the required FPS (Frames Per Second) for the
         * game. By default, this is decided by the "fps" property of the current scene.
         *
         * @method getRequiredFps
         * @return {Number} FPS
         */
        getRequiredFps: function () {
            return this.scene.fps;
        }
    });
});
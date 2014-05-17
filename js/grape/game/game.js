define(['class', 'etc/event-emitter', 'game/game-loop', 'game/input', 'game/scene'], function (Class, EventEmitter, GameLoop, Input, Scene) {
    return Class('Game', EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            this.initialScene = opts.initialScene || function () {
                return new Scene();
            };
            this.container = opts.container || (typeof window != 'undefined' ? document.body : null); //todo env.browser
            this.gameLoop = new GameLoop(this); //TODO move to a function
            if (typeof window != 'undefined') { //todo env.browser
                this.input = new Input();
            }
        },
        'final start': function (scene) {
            if (this.gameLoop.isRunning()) {
                throw 'already running';
            }

            //initialize screen
            if (typeof window != 'undefined') { //todo env.browser
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

            this.gameLoop.start();
            if (this.input) {
                this.input.start(this._screen);
            }
            scene = scene || this.initialScene;
            this.startScene(typeof scene === 'function' ? scene() : scene);
        },
        'final stop': function () {
            this.gameLoop.stop(); //todo tear down logic
            if (this.input) {
                this.input.stop();
            }
            this.emit('stop');
        },
        startScene: function (scene) {
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
            if (this.input) {
                this.input.emitEvents(this.scene); //TODO is it wrong? ie. keyPress.none?
            }
        },
        render: function () {
            this.scene.emit('renderLayer');
        },
        getScreenWidth: function () {
            return this._screen ? this._screen.offsetWidth : 1;
        },
        getScreenHeight: function () {
            return this._screen ? this._screen.offsetHeight : 1;
        },
        setCursor: function (cursor) {
            if (!this._screen) {
                return;
            }
            this._screen.style.cursor = cursor;
        },
        getScene: function () {
            return this.scene; //todo rename to _scene
        }
    });
});
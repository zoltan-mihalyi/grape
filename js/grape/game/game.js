define(['class', 'etc/event-emitter', 'game/game-loop', 'game/input', 'game/scene'], function (Class, EventEmitter, GameLoop, Input, Scene) {
    return Class('Game', EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            this.initialScene = opts.initialScene || function () {
                return new Scene();
            };
            this.container = opts.container || document.body;
            this.gameLoop = new GameLoop(this); //TODO move to a function
            this.input = new Input();
        },
        'final start': function () {
            if (this.gameLoop.isRunning()) {
                throw 'already running';
            }

            //initialize screen
            //TODO create a container with position:absolute
            if (typeof this.container === 'string') {
                this.container = document.getElementById(this.container);
            }
            if (!this.container) {
                throw 'Container does not exists!';
            }
            this._screen = this.container;

            this.gameLoop.start();
            this.input.start(this._screen);
            this.startScene(typeof this.initialScene === 'function' ? this.initialScene() : this.initialScene);
        },
        'final stop': function () {
            this.gameLoop.stop(); //todo tear down logic
            this.input.stop();
        },
        startScene: function (scene) {
            if (scene.game) {
                throw 'Scene already started!';
            }
            if (this.scene) {
                this.scene.emit('stop');
                this.scene.game = null;
            }

            scene.game = this;
            this.scene = scene;
            scene.emit('start', this);
        },
        frame:function(){
            this.scene.emit('frame');
            this.input.emitEvents(this.scene);
        },
        render:function(){
            this.scene.emit('renderLayer');
        },
        getScreenWidth: function () {
            return this._screen.offsetWidth;
        },
        getScreenHeight: function () {
            return this._screen.offsetHeight;
        }
    });
});
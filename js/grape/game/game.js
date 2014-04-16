define(['class', 'etc/event-emitter', 'game/gameloop', 'utils'], function (Class, EventEmitter, GameLoop, Utils) {
    return Class('Game', EventEmitter, {
        init: function (settings) {
            this.settings = {
                container: document.body
            };
            Utils.extend(this.settings, settings);
            this.gameLoop = new GameLoop(this);
        },
        'final start': function (scene) {
            if (!scene) {
                throw 'Game can started with a scene parameter.';
            }
            if (this.gameLoop.isRunning()) {
                throw 'already running';
            }

            //initialize screen
            if (typeof this.settings.container === 'string') {
                this.settings.container = document.getElementById(this.settings.container);
            }
            if (!this.settings.container) {
                throw 'Container does not exists!';
            }
            this._screen = this.settings.container;

            this.gameLoop.start();

            this.startScene(scene);
        },
        'final stop': function () {
            this.gameLoop.stop(); //todo tear down logic
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
        getScreenWidth: function () {
            return this._screen.offsetWidth;
        },
        getScreenHeight: function () {
            return this._screen.offsetHeight;
        }
    });
});
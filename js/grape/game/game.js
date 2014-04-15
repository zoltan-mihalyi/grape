define(['class', 'etc/event-emitter', 'utils'], function (Class, EventEmitter, Utils) {
    var currentGame = null;

    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };

    return Class('Game', EventEmitter, {
        init: function (settings) {
            this.settings = {
                container: document.body
            };
            Utils.extend(this.settings, settings);
            this.intervalId = null;
        },
        'final start': function (scene) {
            var that = this;
            if (this.isRunning()) {
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


            var backlog = 0;
            var last = now();
            var lastRenderStart = last;

            this.intervalId = setInterval(function () {
                currentGame = that;

                var start = now(), ellapsed = start - last, wasFrame = false;
                backlog += ellapsed;
                while (backlog > 0) {
                    backlog -= 1000 / that.scene.fps;
                    wasFrame = true;
                    that.scene.emit('frame');
                    if (now() - lastRenderStart > 16 + 1000 / that.scene.fps) { //can't keep up
                        backlog = 0;
                        console.log('c');
                    }
                }
                if (wasFrame) {
                    last = start;
                    lastRenderStart = now();
                    that.scene.emit('renderLayer'); //TODO can skip render?
                }
                currentGame = null;
            }, 16); //TODO run once before set interval
            //this.emit('start'); //TODO where should we define the starting scene?
            if (scene) {
                this.startScene(scene);
            }
        },
        stop: function () {
            if (!this.isRunning()) {
                throw 'not running';
            }
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        'final isRunning': function () {
            return this.intervalId !== null;
        },
        startScene: function (scene) {
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
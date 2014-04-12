define(['core/class', 'std/event-emitter', 'utils'], function (Class, EventEmitter, Utils) {
    var currentGame = null;

    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };

    return Class('Game', EventEmitter, {
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);
            this.intervalId = null;

        },
        'final start': function (scene) {
            var that = this;
            if (this.isRunning()) {
                throw 'already running';
            }

            var backlog = 0;
            var last = now();

            this.intervalId = setInterval(function () {
                currentGame = that;

                var frames = 0;
                backlog += 16; //TODO ellapsed, cut if over 32
                while (backlog > 0) {
                    frames++;
                    backlog -= 1000 / that.scene.fps;
                    that.scene.emit('frame');

                    if (now() - last > 16 + backlog) { //can't keep up
                        backlog = 0;
                    }
                }
                if (frames > 0) {
                    last = now();
                    that.scene.emit('renderLayer'); //TODO can skip render?
                }
                currentGame = null;
            }, 16); //TODO run once before set interval
            this.emit('start'); //TODO where should we define the starting scene?
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
        }
    });
});
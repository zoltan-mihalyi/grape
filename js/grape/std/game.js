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
            var lastBacklog = 0;

            this.intervalId = setInterval(function () {
                currentGame = that;

                var start = now(), ellapsed = start - last, wasFrame = false;
                backlog += ellapsed;
                while (backlog > 0) {
                    backlog -= 1000 / that.scene.fps;
                    wasFrame = true;
                    that.scene.emit('frame');
                    if (now() - start > backlog - lastBacklog + 8) { //TODO better can't keep up - logic
                        //backlog-= 1000/that.scene.fps;
                        backlog = 0;
                        console.log('c');
                    }
                }
                if (wasFrame) {
                    last = start;
                    lastBacklog = backlog;
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
        }
    });
});
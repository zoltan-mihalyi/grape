define(['../class', '../env'], function (Class, Env) {
    var DROP_FRAME_THRESHOLD = Env.node ? 100 : 0;
    //todov2 different parameters: don't drop frame?
    var reqTimeout, clearReqTimeout, reqInterval, clearReqInterval;
    if (Env.browser) {
        reqTimeout = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.mozRequestAnimationFrame;

        clearReqTimeout = window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            window.mozCancelRequestAnimationFrame;
    }

    if (reqTimeout) { //we have native requestAnimationFrame
        reqInterval = function (callback) {
            var handle;

            function run() {
                callback();
                handle = reqTimeout(run);
            }

            handle = reqTimeout(run);
            return {
                _stop: function () {
                    clearReqTimeout(handle);
                }
            };
        };

        clearReqInterval = function (handle) {
            handle._stop();
        };
    } else { //we have to use a polyfill
        reqTimeout = function (callback) {
            return setTimeout(callback, 16);
        };

        clearReqTimeout = function (handle) {
            clearTimeout(handle);
        };

        reqInterval = function (callback) {
            return setInterval(callback, 16);
        };

        clearReqInterval = function (handle) {
            clearInterval(handle);
        };
    }

    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };

    /**
     * A class which serves as a loop. It uses requestAnimationFrame if possible. It tries to execute the game.frame()
     * game.getRequiredFps() times a second. The game.render() method will be executed 0 or 1 times in each
     * animation frame, depending on the game.frame() was executed at least once or not.
     *
     * @class Grape.GameLoop
     * @constructor
     * @param {Grape.Game} game the game for frame(), render() and getRequiredFps() calls
     */
    return Class('GameLoop', {
        init: function (game) {
            this.intervalId = null;
            this.game = game;
        },
        start: function () {
            if (this.isRunning()) {
                throw new Error('already running');
            }
            var game = this.game;
            var backlog = 0;
            var last = now();
            var lastRenderStart = last;
            this.intervalId = reqInterval(function () {

                var start = now(), wasFrame = false;
                backlog += start - last;
                while (backlog > 0) {
                    backlog -= 1000 / game.getRequiredFps();
                    wasFrame = true;
                    game.frame();
                    if (now() - lastRenderStart > 16 + DROP_FRAME_THRESHOLD + 1000 / game.getRequiredFps()) { //can't keep up
                        backlog = 0;
                    }
                }
                if (wasFrame) {
                    last = start;
                    lastRenderStart = now();
                    game.render(); //TODOv2 can skip render?
                }
            }); //TODOv2 run once before set interval?
        },
        stop: function () {
            if (!this.isRunning()) {
                throw new Error('not running');
            }
            clearReqInterval(this.intervalId);
            this.intervalId = null;
        },
        isRunning: function () {
            return this.intervalId !== null;
        }
    });
});
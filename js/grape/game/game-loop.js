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
                if (handle !== null) { //clearInterval not called inside callback
                    handle = reqTimeout(run);
                }
            }

            handle = reqTimeout(run);
            return {
                _stop: function () {
                    handle = null;
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

    function StopFrame() {
    }

    StopFrame.prototype = new Error();
    StopFrame.prototype.name = 'StopFrame';
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
            this.insideFrame = false;
            this.scheduledCallbacks = [];
        },
        /**
         * Starts the game loop.
         *
         * @method start
         */
        start: function () {
            if (this.isRunning()) {
                throw new Error('already running');
            }
            var game = this.game;
            var that = this;
            var loop = this;
            var backlog = 0;
            var last = now();
            var lastRenderStart = last;
            this.intervalId = reqInterval(function () {

                var start = now(), wasFrame = false;
                backlog += start - last;

                loop.insideFrame = true;
                try {
                    while (backlog > 0) {
                        backlog -= 1000 / game.getRequiredFps();
                        wasFrame = true;
                        game.frame();
                        //can't keep up
                        if (now() - lastRenderStart > 16 + DROP_FRAME_THRESHOLD + 1000 / game.getRequiredFps()) {
                            backlog = 0;
                        }
                    }
                    if (wasFrame) {
                        last = start;
                        lastRenderStart = now();
                        game.render(); //TODOv2 can skip render?
                    }
                } catch (e) {
                    if (!(e instanceof StopFrame)) {
                        throw e;
                    }
                } finally {
                    loop.insideFrame = false;
                }
                for (var i = 0; i < that.scheduledCallbacks.length; i++) {
                    var cb = that.scheduledCallbacks[i];
                    cb();
                }
                if (that.scheduledCallbacks.length) {
                    that.scheduledCallbacks = [];
                }
            }); //TODOv2 run once before set interval?
        },
        /**
         * Stops the game loop
         *
         * @method stop
         */
        stop: function () {
            if (!this.isRunning()) {
                throw new Error('not running');
            }
            clearReqInterval(this.intervalId);
            this.intervalId = null;

            if (this.insideFrame) {
                throw new StopFrame();
            }
        },
        /**
         * Tells whether the game loop is running or not.
         *
         * @method isRunning
         * @return {Boolean} true, if running
         */
        isRunning: function () {
            return this.intervalId !== null;
        },

        /**
         * Restarts the game loop. If inside the frame, the thread stops.
         *
         * @param {Function} [callback] Called after the restart
         * @method restart
         */
        restart: function (callback) { //TODO test
            callback = callback || function () {
            };
            if (this.insideFrame) {
                this.scheduledCallbacks.push(callback);
                throw new StopFrame();
            }else{
                callback();
            }
        }
    });
});
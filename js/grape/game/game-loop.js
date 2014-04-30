define(['class'], function (Class) {
    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };
    var currentGame = null; //TODO use
    return Class('GameLoop', {
        init: function (game) {
            this.intervalId = null;
            this.game = game;
        },
        start: function () {
            var game = this.game;
            var backlog = 0;
            var last = now();
            var lastRenderStart = last;
            this.intervalId = setInterval(function () {
                currentGame = game;

                var start = now(), wasFrame = false;
                backlog += start - last;
                while (backlog > 0) {
                    backlog -= 1000 / game.scene.fps; //TODO replace with custom game.getFPS() logic
                    wasFrame = true;
                    game.frame();
                    if (now() - lastRenderStart > 16 + 1000 / game.scene.fps) { //can't keep up
                        backlog = 0;
                    }
                }
                if (wasFrame) {
                    last = start;
                    lastRenderStart = now();
                    game.render(); //TODO can skip render?
                }
                currentGame = null;
            }, 16); //TODO run once before set interval
        },
        stop: function () {
            if (!this.isRunning()) {
                throw 'not running';
            }
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        isRunning: function () {
            return this.intervalId !== null;
        }
    });
});
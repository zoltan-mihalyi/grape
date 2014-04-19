define(['class', 'etc/position', 'game/game-object'], function (Class, Position, GameObject) {
    return Class('Physical', [Position, GameObject], {
        init: function (opts) {
            opts = opts || {};
            this.speedX = opts.speedX || 0;
            this.speedY = opts.speedY || 0;
        },
        'global-event frame': function () {
            this.x += this.speedX;
            this.y += this.speedY;
        }
    });
});
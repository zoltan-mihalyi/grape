define(['class', 'etc/position', 'game/game-object'], function (Class, Position, GameObject) {
    return Class('Physical', [Position, GameObject], { //TODO more method
        init: function (opts) {
            opts = opts || {};
            this.speedX = opts.speedX || 0;
            this.speedY = opts.speedY || 0;
        },
        getSpeed: function () {
            return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        },
        setSpeed: function (speed) {
            var s = this.getSpeed();
            if (s !== 0) {
                this.vspeed *= speed / s;
                this.hspeed *= speed / s;
            } else {
                this.hspeed = speed;
            }
            return this;
        },
        accelerate: function (plus) {
            var s = this.getSpeed();
            if (s !== 0) {
                this.vspeed *= (s + plus) / s;
                this.hspeed *= (s + plus) / s;
            } else {
                this.setSpeed(plus);
            }
            return this;
        },
        'global-event frame': function () {
            this.x += this.speedX;
            this.y += this.speedY;
        }
    });
});
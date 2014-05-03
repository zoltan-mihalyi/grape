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
                this.speedX *= speed / s;
                this.speedY *= speed / s;
            } else {
                this.speedX = speed; //if speed was 0, start moving right
            }
            return this;
        },
        accelerate: function (plus) {
            var s = this.getSpeed();
            if (s !== 0) {
                this.speedX *= (s + plus) / s;
                this.speedY *= (s + plus) / s;
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
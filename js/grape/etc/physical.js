define(['../class', './position', '../game/game-object'], function (Class, Position, GameObject) {
    //TODOv2 friction, acceleration...
    /**
     * Provides simple physics: velocity. In the future more features can be added like friction or acceleration
     *
     * @class Grape.Physical
     * @uses Grape.Position
     * @uses Grape.GameObject
     */
    return Class('Physical', [Position, GameObject], { //TODOv2 more method
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
            this.setSpeed(this.getSpeed() + plus);
        },
        'global-event frame': function () {
            this.x += this.speedX;
            this.y += this.speedY;
        }
    });
});
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
        /**
         * Returns the speed of the instance, calculated by the speedX and speedY properties.
         *
         * @method getSpeed
         * @return {Number}
         */
        getSpeed: function () {
            return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        },
        /**
         * Sets the speed of the instance, keeping the original direction (or the opposite if speed is negative). If
         * Original speed is 0, the direction is considered as 0 (left-to right).
         *
         * @method setSpeed
         * @param {Number} speed new Speed
         * @chainable
         * @return {Grape.Physical} this
         */
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
        /**
         * Increases the speed by a given amount, keeping the original direction.
         *
         * @method accelerate
         * @param {Number} plus The amount the speed is increased with
         * @chainable
         * @return {Grape.Physical} this
         */
        accelerate: function (plus) {
            return this.setSpeed(this.getSpeed() + plus);
        },
        'global-event frame': function () {
            this.x += this.speedX;
            this.y += this.speedY;
        }
    });
});
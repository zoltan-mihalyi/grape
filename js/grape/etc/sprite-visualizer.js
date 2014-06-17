define(['../class', './visualizer'], function (Class, Visualizer) {
    /**
     * Visualizes a sprite. If no sprite is set, draws a question mark to indicate the error.
     *
     * @class Grape.SpriteVisualizer
     * @uses Grape.Visualizer
     * @constructor
     * @param {Object} [opts] Initial values of properties
     */
    return Class('SpriteVisualizer', Visualizer, {
        init: function (opts) {
            opts = opts || {};
            /**
             * The image index of the sprite to show
             *
             * @property subimage
             * @default 0
             * @type {number}
             */
            this.subimage = opts.subimage || 0;

            /**
             * The sprite
             *
             * @property sprite
             * @type {Grape.Sprite}
             */
            this.sprite = opts.sprite;
        },
        'override visualize': function (ctx) {
            var sprite = this.sprite;
            if (sprite && sprite.img) {
                ctx.drawImage(sprite.img, sprite.left + sprite.width * (Math.round(this.subimage) % sprite.subimages), sprite.top, sprite.width, sprite.height, this.x - sprite.originX, this.y - sprite.originY, sprite.width, sprite.height);
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(this.x, this.y, 32, 32);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText('?', this.x + 11, this.y + 24);
            }
        },
        'override getBounds': function () {
            var s = this.sprite;
            var l = this.x - s.originX;
            var t = this.y - s.originY;
            return {
                left: l + s.leftBounding,
                top: t + s.topBounding,
                right: l + s.rightBounding,
                bottom: t + s.bottomBounding
            };
        },
        'override getLeft': function () {
            return this.x - this.sprite.originX + this.sprite.leftBounding;
        },

        'override getTop': function () {
            return this.y - this.sprite.originY + this.sprite.topBounding;
        },

        'override getRight': function () {
            return this.x - this.sprite.originX + this.sprite.rightBounding;
        },

        'override getBottom': function () {
            return this.y - this.sprite.originY + this.sprite.bottomBounding;
        },

        'override getWidth': function () {
            return this.sprite.rightBounding - this.sprite.leftBounding;
        },

        'override getHeight': function () {
            return this.sprite.bottomBounding - this.sprite.topBounding;
        }
    });
});
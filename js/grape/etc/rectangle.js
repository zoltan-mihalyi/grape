define(['../class', './visualizer'], function (Class, Visualizer) {
    /**
     * A Rectangle visualizer.
     *
     * @constructor
     * @class Grape.Rectangle
     * @uses Grape.Visualizer
     * @param {Object} [opts] Initial values of properties
     */
    return Class('Rectangle', Visualizer, {
        init: function (opts) {
            opts = opts || {};

            /**
             * The width of the rectangle
             *
             * @property width
             * @default 0
             * @type {number}
             */
            this.width = opts.width || 0;
            /**
             * The height of the rectangle
             *
             * @property height
             * @default 0
             * @type {number}
             */
            this.height = opts.height || 0;
            /**
             * The border width
             *
             * @property borderWidth
             * @default 1
             * @type {number}
             */
            this.borderWidth = opts.borderWidth === undefined ? 1 : opts.borderWidth;
            /**
             * The background color
             *
             * @property backgroundColor
             * @default '#fff'
             * @type {number}
             */
            this.backgroundColor = opts.backgroundColor || '#fff';
            this.borderColor = opts.borderColor || '#000';
        },
        'override visualize': function (ctx) { //todov2 background api
            ctx.fillStyle = this.backgroundColor;
            ctx.borderStyle = this.borderColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        'override getBounds': function () {
            return {
                left: this.x,
                top: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            };
        },
        'override getLeft': function () {
            return this.x;
        },

        'override getTop': function () {
            return this.y;
        },

        'override getRight': function () {
            return this.x + this.width;
        },

        'override getBottom': function () {
            return this.y + this.height;
        },

        'override getWidth': function () {
            return this.width;
        },

        'override getHeight': function () {
            return this.height;
        }
    });
});
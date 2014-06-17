define(['../class', './visualizer'], function (Class, Visualizer) {
    /**
     * A Rectangle visualizer.
     *
     * @constructor
     * @param {Object} [opts] Options
     * @param {Number} [opts.width=0] Width
     * @param {Number} [opts.height=0] Height
     * @param {Number} [opts.borderWidth=1] Border width
     * @param {String} [opts.backgroundColor='#fff'] Background color
     * @param {String} [opts.borderColor='#000'] Border color
     * @class Grape.Rectangle
     */
    return Class('Rectangle', Visualizer, {
        init: function (opts) {
            opts = opts || {};
            this.width = opts.width || 0;
            this.height = opts.height || 0;
            this.borderWidth = opts.borderWidth === undefined ? 1 : opts.borderWidth;
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
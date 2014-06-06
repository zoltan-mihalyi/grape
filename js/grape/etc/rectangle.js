define(['class', 'etc/aabb', 'etc/position', 'game/game-object'], function (Class, AABB, Position, GameObject) {
    return Class('Rectangle', [Position, AABB, GameObject], {
        init: function (opts) {
            opts = opts || {};
            this.width = opts.width || 0;
            this.height = opts.height || 0;
            this.borderWidth = opts.borderWidth === undefined ? 1 : opts.borderWidth;
            this.backgroundColor = opts.backgroundColor || '#fff';
            this.borderColor = opts.borderColor || '#000';
        },
        'global-event render': function (ctx) {
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
define(['class', 'etc/aabb', 'etc/position', 'game/game-object'], function (Class, AABB, Position, GameObject) {
    return Class('SpriteVisualizer', [GameObject, Position, AABB], {
        init: function (opts) {
            opts = opts || {};
            if (opts.alpha === undefined) {
                this.alpha = 1;
            } else {
                this.alpha = opts.alpha;
            }
            this.subimage = opts.subimage || 0;
        },
        'global-event render': function (ctx) {
            var sprite = this.sprite;
            ctx.globalAlpha = this.alpha;
            ctx.drawImage(sprite.img, sprite.width * (Math.round(this.subimage) % sprite.subimages), 0, sprite.width, sprite.height, this.x, this.y, sprite.width, sprite.height);
            ctx.globalAlpha = 1;
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
})
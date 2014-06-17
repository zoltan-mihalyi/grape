define(['../class', './aabb', './position', '../game/game-object'], function (Class, AABB, Position, GameObject) {
    return Class('SpriteVisualizer', [GameObject, Position, AABB], {
        init: function (opts) {
            opts = opts || {};
            if (opts.alpha === undefined) {
                this.alpha = 1;
            } else {
                this.alpha = opts.alpha;
            }
            this.subimage = opts.subimage || 0;
            this.sprite = opts.sprite;
        },
        'global-event render': function (ctx) {
            var sprite = this.sprite;
            if (sprite && sprite.img) {
                ctx.globalAlpha = this.alpha;
                ctx.drawImage(sprite.img, sprite.left + sprite.width * (Math.round(this.subimage) % sprite.subimages), sprite.top, sprite.width, sprite.height, this.x - sprite.originX, this.y - sprite.originY, sprite.width, sprite.height);
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(this.x, this.y, 32, 32);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText('?', this.x + 11, this.y + 24);
            }
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
});
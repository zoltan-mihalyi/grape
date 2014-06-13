define(['../class', './aabb', './position', '../game/game-object'], function (Class, AABB, Position, GameObject) {
    return Class('Visualizer', [GameObject, Position, AABB], {
        init: function (opts) {
            opts = opts || {};
            if (opts.alpha === undefined) {
                this.alpha = 1;
            } else {
                this.alpha = opts.alpha;
            }
            if (opts.visible === undefined) {
                this.visible = 1;
            } else {
                this.visible = opts.visible;
            }
        },
        'global-event render': function (ctx) {
            if (this.visible) {
                ctx.globalAlpha = this.alpha;
                this.visualize(ctx);
                ctx.globalAlpha = 1;
            }
        },
        'abstract visualize': null,
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });
});
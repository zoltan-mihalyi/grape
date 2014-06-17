define(['../class', './aabb', './position', '../game/game-object'], function (Class, AABB, Position, GameObject) {
    /**
     * An abstract class for visualizing different things. This class provides alpha and visible properties.
     * It calls the visualize method with the rendering context in each render frame if visible is set to true.
     *
     * @class Grape.Visualizer
     * @uses Grape.GameObject
     * @uses Grape.Position
     *
     * @constructor
     * @param {Object} [opts] The config object
     * @param {Number} [opts.alpha=1] The initial alpha value
     * @param {Boolean} [opts.visible=true] The initial visible value
     */
    return Class('Visualizer', [GameObject, Position, AABB], { //TODOv2
        init: function (opts) {
            opts = opts || {};
            if (opts.alpha === undefined) {
                /**
                 * The alpha value set before calling the visualize method
                 *
                 * @attribute alpha
                 * @property alpha
                 * @default 1
                 * @type {number}
                 */
                this.alpha = 1;
            } else {
                this.alpha = opts.alpha;
            }
            if (opts.visible === undefined) {
                /**
                 * If set false, the visualize method is not called.
                 *
                 * @property visible
                 * @default true
                 * @type {number}
                 */
                this.visible = true;
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
        /**
         * This method is called each render frame if visible is set to true.
         *
         * @method visualize
         * @param {CanvasRenderingContext2D} ctx The rendering context
         * @abstract
         */
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
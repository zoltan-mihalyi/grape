define(['../class', './sprite-visualizer'], function (Class, SpriteVisualizer) {
    /**
     * A utility class which increases a the subimage of a SpriteVisualizer in each frame by a given amount.
     *
     * @class Grape.Animation
     * @constructor
     * @uses Grape.SpriteVisualizer
     * @param [opts] The initial properties
     */
    return Class('Animation', SpriteVisualizer, {
        init: function (opts) {
            opts = opts || {};
            /**
             * The number the subimage is shifted with each second.
             *
             * @property imageSpeed
             * @type number
             * @default 1
             */
            this.imageSpeed = opts.imageSpeed === undefined ? 1 : opts.imageSpeed;
        },
        'global-event frame': function () {
            if (!this.sprite) {
                return;
            }
            var subimages = this.sprite.subimages, nextSubimage = this.subimage + this.imageSpeed;
            if (nextSubimage >= subimages || nextSubimage < 0) {
                this.subimage = nextSubimage % subimages;
                if (this.subimage < 0) {
                    this.subimage += subimages;
                }
                /**
                 * Occurs when the animation falls through the last image (or the first if imageSpeed is negative)
                 *
                 * @event animationEnd
                 */
                this.emit('animationEnd');
            } else {
                this.subimage = nextSubimage;
            }
        }
    });
});
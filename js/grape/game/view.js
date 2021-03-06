define(['../class', '../env', './abstract-view'], function (Class, Env, AbstractView) {
    /**
     * A view using canvas to render. It emits the render event to the layer it is added to, with the canvas context as
     * parameter in each render frame. Because the layer emits any event to its sub-layers, instances in sub-layers are
     * alos visible.
     *
     * @class Grape.View
     * @uses Grape.AbstractView
     * @constructor
     */
    return Class('View', AbstractView, { //TODOv2 custom functions like ctx.extra.drawBackground()
        'override createDom': function () {
            var canvas = document.createElement('canvas');
            /**
             * The context of the view
             *
             * @property ctx
             * @type {CanvasRenderingContext2D}
             */
            this.ctx = canvas.getContext('2d');
            this.ctx.view = this;
            return canvas;
        },
        'event renderLayer': function () {
            if (Env.browser) {
                this.ctx.clearRect(0, 0, this.el.width, this.el.height); //TODOv2 preserve surface (optional)
                this.ctx.translate(-this.x + this.getOriginX(), -this.y + this.getOriginY());
                /**
                 * The render event is emitted to the layer with the canvas context parameter.
                 *
                 * @event render (layer)
                 */
                this._layer.emit('render', this.ctx);
            }
        },
        /**
         * Sets the width and height property for canvas (style.width and style.height are wrong).
         *
         * @method updateSize
         */
        'override updateSize': function () { //TODOv2 preserve data on resizing (optional)
            this.el.width = this.getZoomedWidth();
            this.el.height = this.getZoomedHeight();
        }
    });
});
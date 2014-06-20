define(['../class', '../env', './abstract-view'], function (Class, Env, AbstractView) {
    /**
     * A view using canvas to render. It emits the render event with the canvas context as parameter in each render
     * frame.
     *
     * @class Grape.View
     * @uses Grape.AbstractView
     * @constructor
     */
    return Class('View', AbstractView, {
        /**
         * Creates a HTML5 canvas.
         *
         * @method createDom
         * @return {HTMLCanvasElement} Canvas
         */
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
            this.ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.ctx.translate(-this.x + this.getOriginX(), -this.y + this.getOriginY());
            /**
             * The render event is emitted to the layer with the canvas context parameter.
             *
             * @event render (layer)
             */
            this._layer.emit('render', this.ctx);
        },
        /**
         * Sets the width and height property for canvas (style.width and style.height are wrong).
         *
         * @method updateSize
         */
        'override updateSize': function () {
            this.el.width = this.getWidth();
            this.el.height = this.getHeight();
        }
    });
});
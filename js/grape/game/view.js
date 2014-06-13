define(['../class', '../env', './abstract-view'], function (Class, Env, AbstractView) {
    return Class('View', AbstractView, {
        'override createDom': function () {
            var canvas = document.createElement('canvas');
            this.ctx = canvas.getContext('2d');
            this.ctx.view = this;
            return canvas;
        },
        'event renderLayer': function () {
            this.ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.ctx.translate(-this.x + this.getOriginX(), -this.y + this.getOriginY());
            this._layer.emit('render', this.ctx);
        },
        'override updateSize': function () {
            this.el.width = this.getWidth();
            this.el.height = this.getHeight();
        }
    });
});
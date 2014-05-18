define(['class', 'env','game/abstract-view'], function (Class, Env, AbstractView) {
    return Class('View', AbstractView, {
        createDom: function () {
            var canvas = document.createElement('canvas');
            this.ctx = canvas.getContext('2d');
            this.ctx.view = this;
            return canvas;
        },
        'event renderLayer': function () {
            this.el.width = this.getWidth();
            this.el.height = this.getHeight();
            this.ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.ctx.translate(-this.x, -this.y);
            this._layer.emit('render', this.ctx);
        }
    });
});
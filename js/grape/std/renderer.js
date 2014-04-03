define(['core/class', 'std/event-emitter'], function (Class, EventEmitter) {
    return Class('Renderer', EventEmitter, {
        init: function (opts) {
            var root = opts.root || document.body,
                canvas = document.createElement('canvas');
            if (typeof root === 'string') {
                root = document.getElementById(root);
            }
            root.appendChild(canvas);
            this._canvas = canvas;
            canvas.width = opts.width || 640;
            canvas.height = opts.height || 480;
            this._ctx = canvas.getContext('2d');
        },
        sprite: function (x, y, sprite) {
            this._ctx.drawImage(x, y, sprite.img);
        },
        clear: function () {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
    });
});
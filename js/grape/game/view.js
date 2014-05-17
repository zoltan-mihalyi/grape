define(['class', 'etc/system', 'utils'], function (Class, System, Utils) {
    //TODO follow player etc.

    function propValue(prop, max) {
        if (typeof (prop) === 'function') {
            return prop();
        }
        if (parseFloat(prop) + '' === prop + '') { //number format
            return prop * 1;
        } else {
            return new Function('p', 'return ' + prop.replace(/%/, '/100*p') + ';')(max);
        }
    }

    return Class('View', System, {
        init: function (opts) {
            this.width = '100%';
            this.height = '100%';
            this.left = 0;
            this.top = 0;
            this.originX = 0;
            this.originY = 0;
            this.x = 0;
            this.y = 0;
            this.mouse = {x: 0, y: 0}; //TODO default values
            this.zoom = 1;
            this.alpha = 1;
            Utils.extend(this, opts);
        },
        'event mouseMove': function (mouse) {
            this.mouse.x = mouse.x - this.getLeft();
            this.mouse.y = mouse.y - this.getTop();
        },
        'event start': function (game) {
            this._target = game;
            if (typeof window !== 'undefined') { //todo env.browser
                this.canvas = document.createElement('canvas');
                this.canvas.style.position = 'absolute';
                this.canvas.width = this.getWidth();
                this.canvas.height = this.getHeight();
                this.ctx = this.canvas.getContext('2d');
                this.ctx.view = this;
                game._screen.appendChild(this.canvas);
            }
        },
        'event stop': function () {
            if (this.canvas) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        },
        'event renderLayer': function () {
            if (this.canvas) {
                this.canvas.width = this.getWidth();
                this.canvas.height = this.getHeight();
                this.canvas.style.left = this.getLeft();
                this.canvas.style.top = this.getTop();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.translate(-this.x, -this.y);
                this._layer.emit('render', this.ctx);
            }
        },
        getLeft: function () {
            return propValue(this.left, this._target.getScreenWidth());
        },
        getTop: function () {
            return propValue(this.top, this._target.getScreenHeight());
        },
        getWidth: function () {
            return propValue(this.width, this._target.getScreenWidth());
        },
        getHeight: function () {
            return propValue(this.height, this._target.getScreenHeight());
        },
        getOriginX: function () {
            return propValue(this.originX, this.getWidth());
        },
        getOriginY: function () {
            return propValue(this.originY, this.getHeight());
        }
    });
});
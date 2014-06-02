define(['class', 'env', 'etc/system', 'utils'], function (Class, Env, System, Utils) {
    function propValue(prop, max) {
        /*jslint evil: true */
        if (typeof (prop) === 'function') {
            return prop();
        }
        if (parseFloat(prop) + '' === prop + '') { //number format
            return prop * 1;
        } else {
            return new Function('p', 'return ' + prop.replace(/%/, '/100*p') + ';')(max);
        }
    }

    //TODO follow player etc.
    return Class('AbstractView', System, {
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
        getGame: function () {
            return this._game;
        },
        'event start': function (game) {
            var el;
            this._game = game;
            if (Env.browser) {
                el = this.el = this.createDom();
                el.style.position = 'absolute';
                el.width = this.getWidth();
                el.height = this.getHeight();
                this._game.getScreen().appendChild(el);
                this.emit('domCreated', el);
            }
        },
        'event stop': function () {
            if (Env.browser) {
                this.el.parentNode.removeChild(this.el);
            }
        },
        'event renderLayer': function () {
            this.el.style.left = this.getLeft();
            this.el.style.top = this.getTop();
        },
        'event mouseMove': function (mouse) {
            this.mouse.x = mouse.x - this.getLeft();
            this.mouse.y = mouse.y - this.getTop();
        },
        getLeft: function () {
            return propValue(this.left, this._game.getScreenWidth());
        },
        getTop: function () {
            return propValue(this.top, this._game.getScreenHeight());
        },
        getWidth: function () {
            return propValue(this.width, this._game.getScreenWidth());
        },
        getHeight: function () {
            return propValue(this.height, this._game.getScreenHeight());
        },
        getOriginX: function () {
            return propValue(this.originX, this.getWidth());
        },
        getOriginY: function () {
            return propValue(this.originY, this.getHeight());
        },
        'abstract createDom': null
    });
});
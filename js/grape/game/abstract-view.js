define(['../class', '../env', '../game/system', '../utils'], function (Class, Env, System, Utils) {
    function propValue(prop, max) {
        if (typeof (prop) === 'function') {
            return prop(max);
        }
        if (parseFloat(prop) + '' === prop + '') { //number format
            return prop * 1;
        } else {
            return createFunction('p', 'return ' + prop.replace(/%/g, '/100*p') + ';')(max);
        }
    }

    var fnCache = {}; //params+body -> function
    var cacheOrder = []; //params+body

    function createFunction(params, body) {
        /*jslint evil: true */
        var key = params + ';' + body;
        if (!fnCache[key]) {
            if (cacheOrder.length >= 100) { //cache full
                delete fnCache[cacheOrder.shift()];
            }
            fnCache[key] = new Function(params, body);
            cacheOrder.push(key);
        }
        return fnCache[key];
    }

    //TODOv2 follow player etc.
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
            this.zoom = 1;
            this.alpha = 1;
            Utils.extend(this, opts);
        },
        getGame: function () {
            return this._game;
        },
        _calculateMouse: function (mouse) {
            var viewX = this.mouse.view.x = mouse.x - this.getLeft();
            var viewY = this.mouse.view.y = mouse.y - this.getTop();
            this.mouse.x = viewX + this.x - this.getOriginX();
            this.mouse.y = viewY + this.y - this.getOriginY();
            if (viewX >= 0 && viewY >= 0 && viewX < this.getWidth() && viewY < this.getHeight()) {
                this.getLayer().emit('mouseMoveView', this);
            }
        },
        'event start': function (game) {
            var el;
            this._game = game;
            this.mouse = {
                view: {}
            };
            /* istanbul ignore else */
            if (Env.browser) {
                el = this.el = this.createDom();
                el.style.position = 'absolute';
                this.updateSize();
                this._game.getScreen().appendChild(el);
                this.emit('domCreated', el);
            }
            this._calculateMouse(game.input.mouse);
        },
        'event stop': function () {
            /* istanbul ignore else */
            if (Env.browser) {
                this.el.parentNode.removeChild(this.el);
            }
        },
        'event renderLayer': function () {
            this.el.style.left = this.getLeft() + 'px';
            this.el.style.top = this.getTop() + 'px';
            this.updateSize();
        },
        'event mouseMove': function (mouse) {
            this._calculateMouse(mouse);
        },
        updateSize: function () {
            this.el.style.width = this.getWidth() + 'px';
            this.el.style.height = this.getHeight() + 'px';
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
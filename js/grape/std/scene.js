define(['core/class', 'std/layer', 'std/view', 'utils'], function (Class, Layer, View, Utils) {
    //TODO JSON source
    return Class('Scene', Layer, {
        init: function () {
            this._started = false;
            this.fps = 30;
            this._views = [];
            this.initViews();
        },
        initViews: function () {
            this.addView(new View({target: this})); //todo override
        },
        addView: function (name, view) {
            if (arguments.length === 1) { //no name given
                view = name;
                this._views.push(view);
            } else {
                if (this._views[name]) {
                    throw 'View "' + name + '" already added.';
                }
                this._views[name] = view;
            }
            if (this._started) {
                view.emit('start');
            }
        },
        removeView: function (name) {
            if (typeof name === 'string') {
                if (this._started) {
                    this._views[name].emit('stop');
                }
                delete this._views[name];
            } else {
                if (this._started) {
                    name.emit('stop');
                }
                Utils.removeFromArray(this._views, name);
            }
        },
        render: function () {
            var i;
            for (i in this._views) {
                this._views[i].render();
            }
        },
        'event start': function () {
            this._started = true;
        },
        'event any': function (type, payload) { //TODO start? frame? render?
            var i;
            for (i in this._views) {
                this._views[i].emit(type, payload);
            }
        }
    });
});
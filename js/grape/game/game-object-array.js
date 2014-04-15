define(['class', 'etc/array'], function (Class, Arr) {
    var GameObjectArray = Class('GameObjectArray', Arr, {
        filter: function (callback) {
            var i = 0, max = this.length, el, filtered = new GameObjectArray();
            for (; i < max; ++i) {
                if (callback.call(el = this[i], i, el)) {
                    filtered.push(el);
                }
            }
            return filtered;
        },

        call: function (which/*,params*/) {
            var params = Array.prototype.slice.call(arguments, 1),
                result, method, i = 0, max = this.length;

            for (; i < max; ++i) {
                if ((method = this[i][which]) === undefined) {
                    throw 'Call undefined function: ' + which;
                }
                result = method.apply(this[i], params);
            }

            return result;
        },

        isEmpty: function () {
            return this.length === 0;
        },

        each: function (callback) {
            var i = 0, max = this.length, el;
            for (; i < max; ++i) {
                if (callback.call(el = this[i], i, el) === false) {
                    break;
                }
            }
            return this;
        },

        attr: function (name, newVal) {
            var i = 0, max = this.length;
            if (arguments.length === 1) {
                return this[0] === undefined ? undefined : this[0][name];
            }

            for (; i < max; ++i) {
                this[i][name] = newVal;
            }
            return this;
        },

        eq: function (i) {
            var result = new GameObjectArray();
            if (this[i]) {
                result.push(this[i]);
            }
            return result;
        },

        get: function (i) {
            return this[i];
        },

        one: function () {
            return this[0];
        },

        size: function () {
            return this.length;
        },

        on: function (event, callback) {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i].on(event, callback);
            }
            return this;
        },

        off: function (event, callback) {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i].off(event, callback);
            }
            return this;
        },


        emit: function (event, data) { //TODO all GO method dynamically
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i].emit(event, data);
            }
            return this;
        },

        destroy: function () {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i].destroy();
            }
            return this;
        },

        empty: function () {
            return new GameObjectArray();
        }
        //TODO union, intersect, complement, etc.);
    });

    return GameObjectArray;
});
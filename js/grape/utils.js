define([], function () {
    var objToString = Object.prototype.toString;
    return {
        isArray: function (obj) {
            return objToString.call(obj) === '[object Array]';
        },
        isFunction: function (obj) {
            return objToString.call(obj) === '[object Function]';
        },
        extend: function (target, options) {
            var i;
            for (i in options) {
                target[i] = options[i];
            }
        }
    };
});
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
        },
        removeFromArray: function (array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
            }
            //TODO IE8 fallback
        },
        arrayContains: function (array, element) {
            return array.indexOf(element) !== -1;
            //TODO IE8 fallback
        }
    };
});
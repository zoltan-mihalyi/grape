define([], function () {
    var objToString = Object.prototype.toString;

    var addEventListener, removeEventListener, domContains;

    if (typeof window !== 'undefined') { //TODO check as env.browser or sg.

        if (typeof window.addEventListener === 'function') { //TODO get real event object in listeners, with which, preventDefault, target...
            addEventListener = function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };
            removeEventListener = function (el, ev, fn) {
                el.removeEventListener(ev, fn, false);
            };
        } else if (document.attachEvent) {
            addEventListener = function (el, ev, fn) {
                el.attachEvent('on' + ev, fn);
            };
            removeEventListener = function (el, type, fn) {
                el.detachEvent('on' + type, fn);
            };
        }

        if (document.documentElement.contains) {
            domContains = function (a, b) {
                return b.nodeType !== 9 && a !== b && (a.contains ? a.contains(b) : true);
            };
        } else if (document.documentElement.compareDocumentPosition) {
            domContains = function (a, b) {
                return !!(a.compareDocumentPosition(b) + 0 & 16);
            };
        }
    }

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
                return true;
            }
            return false;
            //TODO IE8 fallback
        },
        arrayContains: function (array, element) {
            return array.indexOf(element) !== -1;
            //TODO IE8 fallback
        },
        ajax: function (url, opts, onSuccess, onError) { //TODO browser compatibility
            if (typeof opts === 'function') { //no opts given
                onError = onSuccess;
                onSuccess = opts;
                opts = {};
            }
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if ((xhr.responseType === 'blob' || xhr.responseType === 'arraybuffer') && xhr.response !== undefined) {
                    onSuccess(xhr.response);
                } else {
                    onSuccess(xhr.responseText);
                }
            }
            xhr.onerror = function () {
                onError();
            }
            xhr.open('get', url, opts.async === undefined ? true : opts.async);

            if (opts.responseType) {
                xhr.responseType = opts.responseType;
            }

            xhr.send();
        },
        parseJSON: function (str) {
            return JSON.parse(str); //TODO fallback
        },
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        domContains: domContains //TODO DOM namespace
    };
});

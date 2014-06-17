define(['./env'], function (Env) {
    var objToString = Object.prototype.toString;

    var addEventListener, removeEventListener, domContains;

    if (Env.browser) {
        if (typeof window.addEventListener === 'function') { //TODOv2 get real event object in listeners, with which, preventDefault, target...
            /**
             * Adds an event listener to a DOM element.
             *
             * @static
             * @method addEventListener
             * @param {HTMLElement} el DOM element
             * @param {String} ev Event name
             * @param {Function} fn Event handler
             */
            addEventListener = function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };
            /**
             * Removes an event listener from a DOM element.
             *
             * @static
             * @method removeEventListener
             * @param {HTMLElement} el DOM element
             * @param {String} ev Event name
             * @param {Function} fn Event handler
             */
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
            /**
             * Decides whether a DOM element contains an other one
             *
             * @static
             * @method domContains
             * @param {HTMLElement} a The container element
             * @param {HTMLElement} b The contained element
             *
             * @returns {boolean} true if the first element contains the second
             */
            domContains = function (a, b) {
                return b.nodeType !== 9 && a !== b && (a.contains ? a.contains(b) : true);
            };
        } else if (document.documentElement.compareDocumentPosition) {
            domContains = function (a, b) {
                return !!(a.compareDocumentPosition(b) + 0 & 16);
            };
        }
    }

    /**
     * Utility class.
     *
     * @static
     * @class Grape.Utils
     */
    return {
        /**
         * Decides whether an object is an array.
         *
         * @static
         * @method isArray
         * @param {*} obj The object to test
         * @returns {boolean} true, if the object is an array
         */
        isArray: function (obj) {
            return objToString.call(obj) === '[object Array]';
        },
        /**
         * Decides whether an object is a function.
         *
         * @static
         * @method isFunction
         * @param {*} obj The object to test
         * @returns {boolean} true, if the object is a function
         */
        isFunction: function (obj) {
            return objToString.call(obj) === '[object Function]';
        },
        /**
         * Copies properties to an object from an other object.
         *
         * @static
         * @method extend
         * @param {Object} target The properties are copied to this object.
         * @param {Object} options The properties are copied from this object
         */
        extend: function (target, options) {
            var i;
            for (i in options) {
                target[i] = options[i];
            }
        },
        /**
         * Finds an element in an array and removes it.
         *
         * @static
         * @method removeFromArray
         * @param {Array} array The array
         * @param {*} element The element to remove
         * @returns {boolean} true, if the item was found and removed
         */
        removeFromArray: function (array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
            //TODOv2 IE8 fallback
        },
        /**
         * Decides whether an array contains an element.
         *
         * @static
         * @method arrayContains
         * @param {Array} array The array
         * @param {*} element The element to find
         * @returns {boolean} true, if found
         */
        arrayContains: function (array, element) {
            return array.indexOf(element) !== -1;
            //TODOv2 IE8 fallback
        },
        /**
         * Sends an AJAX request
         *
         * @static
         * @method ajax
         * @param {String} url Request url
         * @param {Object} [opts] Options AJAX options
         * @param {Boolean} [opts.async] The request is asynchronous
         * @param {String} [opts.responseType] the XHR responseType
         * @param {Function} onSuccess Success event handler. The parameter is the response text.
         * @param {Function} onError Error callback
         */
        ajax: function (url, opts, onSuccess, onError) { //TODOv2 browser compatibility
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
            };
            xhr.onerror = function () {
                onError();
            };
            xhr.open('get', url, opts.async === undefined ? true : opts.async);

            if (opts.responseType) {
                xhr.responseType = opts.responseType;
            }

            xhr.send();
        },
        parseJSON: function (str) {
            return JSON.parse(str); //TODOv2 fallback
        },
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        domContains: domContains //TODOv2 DOM namespace
    };
});

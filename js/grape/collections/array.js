define(['../class'], function (Class) {
    var returnsNewArray = ['slice', 'filter', 'map'], //must return a new instance of the class instead of the native array
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        methods, methodNames, i, orig;


    /**
     * An array class created with Grape.Class mixing all of the Array.prototype methods and some new utility.
     * Some functions are modified (like slice) to return a new instance of the current class instead of a plain array.
     * If you extend this class, these methods will return an instance of your class.
     * In the future, we should create implementations of default methods for old browsers
     *
     * @constructor
     * @class Grape.Array
     */
    methods = {
        /**
         * Calls a method of each item. The subsequent parameters are passed to the method.
         *
         * @method call
         * @param which {String} The method name to call
         * @returns {Grape.Array} this
         */
        call: function (which/*,params*/) {
            var params = Array.prototype.slice.call(arguments, 1),
                i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },
        /**
         * Calls a method of each item, but the parameters are passed as an array like in Function.prototype.apply
         *
         * @method apply
         * @param which {String} The method name to call
         * @param params {Array} The method parameters
         * @returns {Grape.Array} this
         */
        apply: function (which, params) {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },

        /**
         * Returns true if the length of the array is 0.
         *
         * @method isEmpty
         * @returns {boolean} true, if length is 0
         */
        isEmpty: function () {
            return this.length === 0;
        },

        /**
         * Creates a native Array by copying the items
         *
         * @method toArray
         * @returns {Array} The native Array
         */
        toArray: function () {
            return slice.call(this, 0);
        },

        /**
         * Sets an attribute on each item.
         *
         * @method attr
         * @param name {String} The attribute name
         * @param newVal {*} The new value of the attribute
         * @returns {Grape.Array} this
         */
        attr: function (name, newVal) { //todov2 use as attr({x:10, y:20})
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][name] = newVal;
            }
            return this;
        },

        /**
         * Creates a new instance of the current class, containing the item at the index i if exists, or an empty array
         *
         * @method eq
         * @param i {number}
         * @returns {Grape.Array} the array containing 0 or 1 item
         */
        eq: function (i) {
            var result = new (this.getClass())();
            if (this.length > i) {
                result.push(this[i]);
            }
            return result;
        },

        /**
         * Returns an item at the given position. Equivalent to arr[i].
         *
         * @method get
         * @param i {number} the index of the item to return
         * @returns {*} the item at the given position
         */
        get: function (i) {
            return this[i];
        },

        /**
         * Returns one (the first) item from the array.
         *
         * @method one
         * @returns {*} the first item
         */
        one: function () {
            return this[0];
        },

        /**
         * Returns a new instance of the current class containing random items from the original array.
         *
         * @method random
         * @param num {number|undefined} the number of random items. If not set returns one item.
         * @return {Grape.Array} the random items
         */
        random: function (num) {
            var result;
            if (num === undefined) {
                return this[Math.random() * this.length >> 0];
            }

            result = this.clone(); //todov2 performance
            while (result.length > num) {
                result.splice(Math.random() * result.length >> 0, 1);
            }
            return result;
        },

        /**
         * Clones the array (shallow copy) by creating a new instance of the current class.
         *
         * @method clone
         * @return {*}
         */
        clone: function () {
            return this.slice(0);
        },

        /**
         * Returns the length of the array.
         *
         * @method size
         * @return {number} the size of the array
         */
        size: function () {
            return this.length;
        }
        //TODOv2 union, intersect, complement, etc.);

    };

    //TODOv2 implement methods if not available
    if (Object.getOwnPropertyNames) {
        methodNames = Object.getOwnPropertyNames(Array.prototype);
    } else {
        methodNames = ['concat', 'constructor', 'indexOf', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'splice', 'sort', 'toString', 'unshift', 'valueOf']; //IE8
    }

    for (i = methodNames.length - 1; i >= 0; i--) {
        methods[methodNames[i]] = Array.prototype[methodNames[i]];
    }

    function createProxy(orig) {
        return function () {
            var result = new (this.getClass())();
            var origResult = orig.apply(this, arguments);
            origResult.splice(0, 0, 0, 0); //push 0 twitce at the beginning
            splice.apply(result, origResult); //result.splice(0,0,r1,r2,r3..): push all items to the result array
            return result;
        };
    }

    for (i = returnsNewArray.length - 1; i >= 0; i--) {
        orig = methods[returnsNewArray[i]];
        methods[returnsNewArray[i]] = createProxy(orig);
    }


    return Class('Array', methods);
});
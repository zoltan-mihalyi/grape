define(['../class'], function (Class) {
    var returnsNewArray = ['slice', 'filter', 'map'], //must return a new instance of the class instead of the native array
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        methods, methodNames, i, orig;

    methods = {
        call: function (which/*,params*/) {
            var params = Array.prototype.slice.call(arguments, 1),
                i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },
        apply: function (which, params) {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][which].apply(this[i], params);
            }
            return this;
        },

        isEmpty: function () {
            return this.length === 0;
        },

        toArray: function () {
            return slice.call(this, 0);
        },

        attr: function (name, newVal) { //todo use as attr({x:10, y:20})
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][name] = newVal;
            }
            return this;
        },

        eq: function (i) {
            var result = new (this.getClass())();
            if (this.length > i) {
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

        random: function (num) {
            var result, rand;
            if (num === undefined) {
                return this[Math.random() * this.length >> 0];
            }

            result = this.clone(); //todo performance
            while (result.length > num) {
                result.splice(Math.random() * result.length >> 0, 1);
            }
            return result;
        },

        clone: function () {
            return this.slice(0);
        },

        size: function () {
            return this.length;
        }
        //TODO union, intersect, complement, etc.);

    };

    //TODO implement methods if not available
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
            splice.apply(result, origResult); //result.splice(0,0,r1,r2,r3..): push all elements to the result array
            return result;
        }
    }

    for (i = returnsNewArray.length - 1; i >= 0; i--) {
        orig = methods[returnsNewArray[i]];
        methods[returnsNewArray[i]] = createProxy(orig);
    }


    return Class('Array', methods);
});
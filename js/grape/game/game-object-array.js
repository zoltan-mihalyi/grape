define(['../class', '../collections/array', './game-object'], function (Class, Arr, GameObject) {
    var methods = {};

    function createProxy(method) {
        return function () {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][method].apply(this[i], arguments);
            }
            return this;
        };
    }

    for (var i in GameObject.methods) {
        methods[i] = createProxy(i);
    }

    /**
     * A special array, which contains GameObjects and provides the same methods as the GameObject. The methods iterate
     * through the elements, and calls the same method for each element with the given parameters.
     *
     * @class Grape.GameObjectArray
     * @uses Grape.Array
     * @constructor
     */
    return Class('GameObjectArray', Arr, methods);
});
define(['class', 'collections/array', 'game/game-object'], function (Class, Arr, GameObject) {
    var methods = {};

    function createProxy(method) {
        return function () {
            var i = 0, max = this.length;
            for (; i < max; ++i) {
                this[i][method].apply(this[i], arguments);
            }
            return this;
        }
    }

    for (var i in GameObject.methods) {
        methods[i] = createProxy(i);
    }

    return Class('GameObjectArray', Arr, methods);
});
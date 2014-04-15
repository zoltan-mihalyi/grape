define(['class', 'game/layer-base'], function (Class, LayerBase) {

    //TODO
    return Class('TiledLayer', LayerBase, {
        init: function () {
            this._map = {};
        },
        add: function (instance, x, y) {
            var key = x + ',' + y;
            if (!this._map[key]) {
                this._map[key] = [];
            }
            this._map[key].push(instance);
        },
        remove:function(instance){

        }
    });
});
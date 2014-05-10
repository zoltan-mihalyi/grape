define([],function(){
    var Mapper = Grape.Class('Mapper', {
        init: function () {
            this._byId = [];
            this._byName = {};
        },
        add: function (name, object) {
            this._byName[name] = {
                id: this._byId.length,
                object: object
            };
            this._byId.push(object);
        },
        get: function (name) {
            return this._byName[name].object;
        },
        getId: function (name) {
            return this._byName[name].id;
        },
        getById: function (id) {
            return this._byId[id];
        }
    });

    return Mapper;
});
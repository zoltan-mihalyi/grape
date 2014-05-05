define(['class'], function (Class) {
    var isServer = typeof process === 'object' && typeof process.env === 'object'; //todo env.node

    function empty() {
    }

    Class.registerKeyword('clientSide', {
        onInit: function (classInfo) {
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (isServer) {
                if (classInfo.methods[methodDescriptor.name]) { //we have a serverSide method
                    return false;
                } else { //no serverSide method, we need an empty function
                    methodDescriptor.method = empty;
                }
            } //on client we do nothing
        },
        onFinish: function (classInfo) {

        }
    });
    Class.registerKeyword('serverSide', {
        onAdd: function (classInfo, methodDescriptor) {
            if (!isServer) {
                if (classInfo.methods[methodDescriptor.name]) { //we have a clientSide method
                    return false;
                } else { //no clientSide method, we need an empty function
                    methodDescriptor.method = empty;
                }
            }
            //on server we do nothing
        }
    });

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

    return Grape.Multiplayer = {
        Mapper: Mapper
    };
});
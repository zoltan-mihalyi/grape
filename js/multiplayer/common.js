define(['class'], function (Class) { //todo normalize multiplayer module loading
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
    
    var Synchronized=Grape.Class('Multiplayer.Synchronized',Grape.GameObject,{
        init:function(){
            this._syncedId=1;//TODOthis.getGame().nextSyncedId();
            this._dirtyAttrs={};
            this._isDirty=false;
        },
        'serverSide syncedAttr':function(attrs){
            console.log(attrs);
            var i;
            for(i in attrs){
                this._dirtyAttrs[i]=attrs[i];
                this[i]=attrs[i];
                this._isDirty=true;
            }
        },
        'global-event multiplayer':function(messages){ //TODO name
            if(this._isDirty){
                messages.push({
                    command:'attrSync',
                    data:{id:this._syncedId, attrs:this._dirtyAttrs}
                });
                this._dirtyAttrs={};
                this._isDirty=false;
            }
        }
    });

    return Grape.Multiplayer = {
        Mapper: Mapper,
        Synchronized: Synchronized
    };
});
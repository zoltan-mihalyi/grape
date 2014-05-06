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
    Class.registerKeyword('command', { //todo require controllable class?
        onAdd: function (classInfo, methodDescriptor) {
            var originalMethod, name;
            if (!isServer) {
                originalMethod=methodDescriptor.method;
                name=methodDescriptor.name;
                methodDescriptor.method=function(){
                   if(this._controllable){                       
                       this.getGame().sendMessage('command', {
                            command:name,
                            id:this._syncedId,
                            parameters:arguments
                        }); //todo apply command restrictions (once per frame, etc.)
                       return originalMethod.apply(this, arguments);
                   }
               };
               methodDescriptor.method._original=originalMethod;
            }
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
            this._dirtyAttrs={};
            this._isDirty=false;
        },
        'event add':function(layer){
            if(!layer._nextSyncedId){ //TODO not this way
                layer._nextSyncedId=1;
            }
            this._syncedId=layer._nextSyncedId++;
        },
        'serverSide syncedAttr':function(attrs){ //todo use as prop, value
            console.log(attrs);
            var i;
            for(i in attrs){
                this._dirtyAttrs[i]=attrs[i];
                this[i]=attrs[i];
                this._isDirty=true;
            }
        },
        'global-event sendMessages':function(messages){ //TODO name
            if(this._isDirty){
                messages.sendForAll({
                    command:'attrSync',
                    data:{id:this._syncedId, attrs:this._dirtyAttrs}
                });
                this._dirtyAttrs={};
                this._isDirty=false;
            }
        }
    });
    
    var Controllable=Grape.Class('Controllable', Synchronized,{
        init:function(){
            this._commands=[];
            //todo control added to someone else
            this._controller=null; //todo multiple controllers
            this._isDirtyC=false; //todo variables with same name?
        },
        addController:function(user){
            this._controller=user; //TODO on user reconnect who is the controller? free the resource! offline user?
            this._isDirtyC=true;
        },
        'global-event sendMessages':function(messages){
            if(this._isDirtyC){
                messages.sendForUser(this._controller, {
                    command:'controlAdded',
                    data:{
                        id:this._syncedId
                    }
                });
                this._isDirtyC=false;
            }
        }
    });

    return Grape.Multiplayer = {
        Mapper: Mapper,
        Synchronized: Synchronized,
        Controllable: Controllable
    };
});
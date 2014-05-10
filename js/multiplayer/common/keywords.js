define([],function(){
    var isServer = typeof process === 'object' && typeof process.env === 'object'; //todo env.node

    function empty() {
    }

    Grape.Class.registerKeyword('clientSide', {
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
    Grape.Class.registerKeyword('serverSide', {
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
    Grape.Class.registerKeyword('command', { //todo require controllable class? need different file?
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

});
define(['common/interfaces'], function (Interfaces) { //todo separate this to different files
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

});
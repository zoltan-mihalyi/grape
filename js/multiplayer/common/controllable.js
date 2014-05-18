define(['common/synchronized'], function (Synchronized) {
    var isServer = Grape.Env.node; //todo configure?

    Grape.Class.registerKeyword('command', { //todo require controllable class
        onAdd: function (classInfo, methodDescriptor) {
            var originalMethod, name;
            if (!isServer) {
                originalMethod = methodDescriptor.method;
                name = methodDescriptor.name;
                methodDescriptor.method = function () {
                    if (this.isControllable()) {
                        this.getGame().addMessage('command', {
                            command: name, //todo compress
                            instance: this,
                            parameters: arguments
                        }); //todo apply command restrictions (once per frame, etc.)
                        return originalMethod.apply(this, arguments);
                    }
                };
                methodDescriptor.method._original = originalMethod;
            }
        }
    });

    var Controllable = Grape.Class('Controllable', Synchronized, {
        init: function () {
            this._controller = null; //todo multiple controllers
        },
        'serverSide setControllable': function (user) {
            if (this._controller !== null) {
                this._controller._messageBuffer.addMessage('unsetControllable', { //if the instance was controllable, we revoke the control.
                    instance: this
                });
                this.emit('unsetControllable');
            }
            this._controller = user; //TODO on user reconnect who is the controller? free the resource! offline user?
            user._messageBuffer.addMessage('setControllable', {
                instance: this
            });
            this.emit('setControllable');
        },
        'clientSide setControllable': function () {
            this._controller = true;
            this.emit('setControllable');
        },
        isControllable: function () {
            return this._controller !== null;
        }
    });

    return Controllable;
});
define(['common/interfaces'], function (Interfaces) {
    var nextId = 1;
    //todo handle what if connection closed, game ended etc.
    var User = Grape.Class('Multiplayer.User', [Grape.EventEmitter, Grape.Taggable], {
        init: function (ws) {
            var user = this;
            this._id = nextId++;
            this._ws = ws;
            this._target = null;
            ws.on('message', function (message) {
                if (this._target !== null) {
                    Interfaces.serverInterface.receiveMessages(message, user, function (method, parameters) {
                        user.remote[method].apply(user, parameters);
                    });
                }
            });
            ws.on('close', function () {
                user.emit('disconnect');
            });
            this._messageBuffer = Interfaces.clientInterface.createBuffer(this, function (msg) {
                ws.send(msg);
            });
        },
        disconnect: function () {
            this._ws.close();
            this.emit('disconnect');
        },
        'event disconnect': function () { //todo remove user from game's list
            if (this._target) {
                this._target.emit('userLeft', this);
            }
        },
        addMessage: function (method, parameters) {
            this._target._dirtyUsers[this._id] = this;
            this._messageBuffer.addMessage(method, parameters);
        },
        remote: {
            command: function (command, instance, parameters) {
                var i;
                instance[command](parameters);
                for (i = 0; i < this._target._users.length; i++) { //todo optimize loop
                    if (this._target._users[i] === this) {
                        continue;
                    }
                    this._target._users[i].addMessage('command', { //broadcast to the other users
                        command: command,
                        instance: instance,
                        parameters: parameters
                    });
                }
            }
        }
    });

    return User;
});
define(['common/interfaces'], function (Interfaces) {
    var nextId = 1;
    //todo handle what if connection closed, game ended etc.
    var User = Grape.Class('Multiplayer.User', [Grape.EventEmitter, Grape.Taggable], {
        init: function (ws) {
            var user = this;
            this._id = nextId++;
            console.log('User connected: ' + this._id);
            this._ws = ws;
            this._game = null;
            ws.on('message', function (message) {
                if (user._game !== null) {
                    Interfaces.serverInterface.receiveMessages(message, user, function (method, parameters) {
                        user.remote[method].apply(user, parameters);
                    });
                }
            });
            ws.on('close', function () {
                console.log('User socket closed: ' + user._id);
                user.emit('disconnect');
            });
            this._messageBuffer = Interfaces.clientInterface.createBuffer(this, function (msg) {
                try {
                    ws.send(msg);
                } catch (e) {
                    console.log('Failed to send message to ' + user._id);
                }
            });
        },
        disconnect: function () {
            this._ws.close();
            this.emit('disconnect');
        },
        'event disconnect': function () { //todo remove user from game's list
            console.log('User disconnected: ' + this._id);
            if (this._game) {
                this._game.emit('userLeft', this);
            }
        },
        addMessage: function (method, parameters) {
            if (this._game) {
                this._game._dirtyUsers[this._id] = this;
                this._messageBuffer.addMessage(method, parameters);
            } else {
                console.log('User is not in game: ' + this._id);
            }
        },
        remote: {
            command: function (command, instance, parameters) {
                var i;
                instance[command](parameters);
                for (i = 0; i < this._game._users.length; i++) { //todo optimize loop
                    if (this._game._users[i] === this) {
                        continue;
                    }
                    this._game._users[i].addMessage('command', { //broadcast to the other users
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
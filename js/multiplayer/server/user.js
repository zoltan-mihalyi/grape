define([],function(){

    var User = Grape.Class('Multiplayer.User', [Grape.EventEmitter, Grape.Taggable], {
        init: function (ws) {
            var user = this;
            this._ws = ws;
            this._game = null;
            ws.on('message', function (message) {
                user.emit('message', message);
            });
            ws.on('close', function () {
                user.emit('disconnect');
            });
        },
        'event message': function (message) { //TODO what if game is closed?
            message=JSON.parse(message);
            var data=message.data;
            //todo dispatch by command
            if(message.command==='command'){
                for(var i=0;i<this._game._users.length;i++) {
                    if(this._game._users[i]!==this) { //todo who is permitted to see we executed a command?
                        this._game._users[i].send('command', data);
                    }
                }
                //TODO optimize
                var all=this._game.scene.get();
                for(var i=0;i<all.length;i++){
                    if(all[i]._syncedId===data.id){
                        all[i][data.command].apply(all[i],data.parameters);
                    }
                }
            }
        },
        disconnect: function () {
            this.ws.close();
            this.emit('disconnect');
        },
        send: function (command, data) {
            this._ws.send(JSON.stringify({
                command: command,
                data: data
            }));
        },
        sendAll: function (messages) {
            this._ws.send(JSON.stringify(messages));
        },
        'event disconnect':function(){ //todo remove user from game's list
            if(this._game){
                this._game.emit('userLeft', this);
            }
        }
    });

    return User;
});
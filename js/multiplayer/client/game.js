define(['client/connection'], function(Connection){

    var Game = Grape.Class('Multiplayer.Game', Grape.Game, {
        connect: function (opts) { //todo check
            this._connection = new Connection(opts);
            this._connection._game = this;
            this._connection._start();
        },
        getConnection: function () {
            return this._connection;
        },
        sendMessage:function(command, data){
            this._connection.sendMessage(command,data);
        }
    });

    return Game;
});
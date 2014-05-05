define(['grape', 'common'], function (Grape, Common) {
    /*global Grape, WebSocket*/
    //TODO read json levels without ajax

    var Connection = Grape.Class('Multiplayer.Connection', Grape.EventEmitter, {
        STATUS_CONNECTING: 0,
        STATUS_OPEN: 1,
        STATUS_CLOSED: 2,
        STATUS_ERROR: 3,
        init: function (opts) {
            this._opts = opts;
        },
        _start: function () {
            var opts = this._opts || {},
                address = opts.address || 'localhost',
                conn = this, websocket = new WebSocket('ws://' + address);

            this._mapper = opts.mapper || {};
            this._status = this.STATUS_CONNECTING;

            this._ws = websocket;
            websocket.onopen = function (evt) {
                conn._status = conn.STATUS_OPEN;
                conn.emit('connect');
            };
            websocket.onclose = function (evt) {
                conn._status = conn.STATUS_CLOSED;
                conn.emit('close');
            };
            websocket.onmessage = function (evt) {
                var message = JSON.parse(evt.data);
                conn.emit(message.command, message.data);
            };
            websocket.onerror = function (evt) {
                conn._status = conn.STATUS_ERROR;
                conn.emit('error');
            };
            delete this._opts;
        },
        'event gameStarted': function (data) {
            console.log(data.sceneParameters);
            var Scene = this._mapper[data.sceneId];
            if (!Scene) {
                throw 'Scene does not exist in mapper: ' + data.sceneId;
            }
            this._game.startScene(new Scene(data.sceneParameters));
        },
        getStatus: function () {
            return this._status;
        }
    });

    var Game = Grape.Class('Multiplayer.Game', Grape.Game, {
        connect: function (opts) { //todo check
            this._connection = new Grape.Multiplayer.Connection(opts);
            this._connection._game = this;
            this._connection._start();
        },
        getConnection: function () {
            return this._connection;
        }
    });

    Grape.Multiplayer.Connection = Connection;
    Grape.Multiplayer.Game = Game;

});
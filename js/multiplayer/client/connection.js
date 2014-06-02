define(['common/interfaces'], function (Interfaces) {

    var Connection = Grape.Class('Multiplayer.Connection', Grape.EventEmitter, {
        STATUS_CONNECTING: 0,
        STATUS_OPEN: 1,
        STATUS_CLOSED: 2,
        STATUS_ERROR: 3,
        init: function (opts, game) {
            opts = opts || {};
            var address = opts.address || 'localhost',
                secure = opts.secure === undefined ? 'auto' : opts.secure,
                conn = this,
                websocket;
            if (address.indexOf('ws://') !== 0 && address.indexOf('wss://') !== 0) {
                if (secure === 'auto') {
                    secure = location.protocol === 'https:';
                }
                if (secure) {
                    address = 'wss://' + address;
                } else {
                    address = 'ws://' + address;
                }
            }
            websocket = new WebSocket(address);
            this._status = this.STATUS_CONNECTING;
            this._ws = websocket;
            websocket.onopen = function () {
                conn._status = conn.STATUS_OPEN;
                conn.emit('connect');
            };
            websocket.onclose = function () {
                conn._status = conn.STATUS_CLOSED;
                conn.emit('close');
            };
            websocket.onmessage = function (evt) {
                Interfaces.clientInterface.receiveMessages(evt.data, game, function (method, parameters) {
                    game.remote[method].apply(game, parameters);
                });
            };
            websocket.onerror = function () {
                conn._status = conn.STATUS_ERROR;
                conn.emit('error');
            };

            this._messageBuffer = Interfaces.serverInterface.createBuffer(game, function (msg) {
                websocket.send(msg);
            });
            this._game = game;
        },
        isActive: function () {
            return this._status <= 1;
        },
        getStatus: function () {
            return this._status;
        }
    });

    return Connection;

});
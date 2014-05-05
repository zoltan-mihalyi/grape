define(['common'], function (Common) {
    /*global Grape*/
    var WebSocketServer = require('ws').Server; //TODO 'not running' error

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
        'event message': function (message) {
            console.log('received: %s', message);
        },
        disconnect: function () {
            this.ws.close();
            this.emit('disconnect');
        },
        send: function (command, data) {
            console.log(data);
            this._ws.send(JSON.stringify({
                command: command,
                data: data
            }));
        }
    });

    var Server = Grape.Class('Multiplayer.Server', Grape.EventEmitter, {
        init: function (opts) {
            opts = opts || {};
            var server = this;
            this._mapper = opts.mapper || {};
            this._users = new Grape.TagContainer();
            this._games = new Grape.Bag();

            this.wss = new WebSocketServer({
                port: opts.port || 8080
            });
            this.wss.on('connection', function (ws) {
                var user = new User(ws);
                user._server = server;
                user.addToTagContainer(server._users);
                user.addTag('ALL');
                user.on('disconnect', function () {
                    user.removeFromTagContainer();
                });
                server.emit('connection', user);
            });
        },
        getUsers: function (tag) { //TDOO copy?
            var result = this._users._tags[tag || 'ALL'];
            if (result) {
                return result.slice(0);
            } else {
                return [];
            }
        },
        startGame: function (opts) { //todo use custom game class
            var server = this,
                sceneId = opts.scene,
                users = opts.users || [],
                sceneParameters = opts.sceneParameters || {},
                game = new Grape.Game(), //TODO
                Scene = this._mapper[sceneId],
                scene, i;
            if (Scene) {
                scene = new Scene(sceneParameters);
            } else {
                throw 'Scene ' + sceneId + ' is missing from the mapper.';
            }
            game._gameIdx = this._games.add(game) - 1; //TODO this indexing functionality to a separate component
            game._users = users.slice(0);
            for (i = 0; i < users.length; ++i) {
                users[i]._game = game;
            }
            game.on('stop', function () {
                //remove game from server
                var moved = server._games.remove(game._gameIdx);
                if (moved) {
                    moved._gameIdx = game._gameIdx;
                }
                //remove users from game
                for (i = 0; i < this._users.length; ++i) {
                    this._users[i]._game = null;
                }
            });
            game.start(scene);
            for (i = 0; i < users.length; ++i) {
                users[i].send('gameStarted', {
                    sceneId: sceneId,
                    sceneParameters: sceneParameters
                });
            }
        }
    });

    Grape.Multiplayer.Server = Server;
});
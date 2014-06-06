define(['common/interfaces', 'server/user'], function (Interfaces, User) {
    var WebSocketServer = require('ws').Server;

    var nextId = 1;

    //TODO settings for logging
    var Server = Grape.Class('Multiplayer.Server', Grape.EventEmitter, { //todo use socket.io
        init: function (opts) {
            opts = opts || {};
            var server = this, httpServer = opts.server, port = opts.port || 8080, wssOpts = {};

            this._mapper = opts.mapper || {};
            this._users = new Grape.TagContainer();
            this._games = new Grape.Bag();

            if (httpServer) { //bind the ws server on the top of a http server
                if (httpServer === true) { //create a new http server

                    httpServer = require('http').createServer(function (req, res) {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('This is a default http server for Grape.js multiplayer websocket server.\n');
                    }).listen(port);
                } else { //bind to an existing http server
                    if (opts.port) { //server and port parameter are exclusive
                        throw 'If you bind the server to an existing http server, you can not set a port parameter!';
                    }
                }

                wssOpts.server = httpServer;
            } else {
                wssOpts.port = port;
            }

            this.wss = new WebSocketServer(wssOpts);
            this.wss.on('connection', function (ws) {
                var user = new User(ws);
                user._server = server;
                user.setTagContainer(server._users);
                user.addTag('ALL');
                user.on('disconnect', function () {
                    user.removeTagContainer();
                });
                server.emit('connection', user);
            });
            console.log('Server listening on ' + port);
        },
        getUsers: function (tag) {
            return this._users.get(tag || 'ALL');
        },
        startGame: function (opts) { //todo use custom game class
            var server = this,
                sceneName = opts.scene,
                users = opts.users || [],
                sceneParameters = opts.sceneParameters || {},
                game = new Grape.Game(), //TODO
                sceneId = this._mapper.getId(sceneName),
                Scene = this._mapper.get(sceneName),
                scene, i;
            if (Scene) {
                scene = new Scene(sceneParameters);
            } else {
                throw 'Scene ' + sceneName + ' is missing from the mapper.';
            }
            game._id = nextId++;
            game._server = this;
            game._gameIdx = this._games.add(game) - 1; //TODO this indexing functionality to a separate component
            game._users = users.slice(0);
            game._dirtyUsers = {};
            game.addMessage = function (type, parameters) { //todo inherit somehow
                var i = 0, n = this._users.length;
                for (; i < n; i++) {
                    this._users[i].addMessage(type, parameters);
                }
            };
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
                var dropped = [];
                for (i = 0; i < this._users.length; ++i) {
                    dropped.push(this._users[i]._id);
                    this._users[i]._game = null;
                }
                console.log('Game stopped: ' + game._id + ', dropped users: ' + dropped);
            });
            scene.on('frame', function () { //todo change scene inside game?
                var i;
                for (i in game._dirtyUsers) {
                    game._dirtyUsers[i]._messageBuffer.flushMessages();
                }
                game._dirtyUsers = {};
            });
            game.addMessage('startScene', {
                sceneId: sceneId,
                sceneParameters: sceneParameters
            });
            game.start(scene);
            var userIds = [];
            for (i = 0; i < users.length; i++) {
                userIds.push(users[i]._id);
            }
            console.log('Game started: ' + game._id + '. Scene: ' + sceneName + ', users: ' + userIds);
            return game;
        }
    });

    return Server;
});
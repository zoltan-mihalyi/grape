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
            message=JSON.parse(message);
            var data=message.data;
            //todo dispatch by command
            if(message.command==='command'){
                this.send('command',data);
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
    
    var MessageList=Grape.Class('Multiplayer.MessageList', {
        init:function(){
            this._forAll=[];
            this._forUser=[];
        },
        sendForAll:function(message){
            this._forAll.push(message);
        },
        sendForUser:function(user, message){
            this._forUser.push({user:user, message:message});
        },
        sendReal:function(game){ //todo confusing name, send one message/user
            var i;
            if(this._forAll.length){
                for(i=0;i<game._users.length;i++){
                    game._users[i].sendAll(this._forAll);
                }
            }
            for(i=0;i<this._forUser.length;i++){
                this._forUser[i].user.send(this._forUser[i].message.command, this._forUser[i].message.data); //todo ugly
            }
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
                sceneName = opts.scene,
                users = opts.users || [],
                sceneParameters = opts.sceneParameters || {},
                game = new Grape.Game(), //TODO
                sceneId=this._mapper.getId(sceneName),
                Scene = this._mapper.get(sceneName),
                scene, i;
            if (Scene) {
                scene = new Scene(sceneParameters);
            } else {
                throw 'Scene ' + sceneName + ' is missing from the mapper.';
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
            scene.on('frame', function(){
                var messages=new MessageList();
                this.emit('sendMessages', messages);
                messages.sendReal(game);
            });
            game.start(scene);
            for (i = 0; i < users.length; ++i) {
                users[i].send('gameStarted', {
                    sceneId: sceneId,
                    sceneParameters: sceneParameters
                });
            }
            return game;
        }
    });

    Grape.Multiplayer.Server = Server;
});
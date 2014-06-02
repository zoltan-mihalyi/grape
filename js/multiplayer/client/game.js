define(['client/connection', 'common/interfaces'], function (Connection/*, Interfaces*/) {

    var Game = Grape.Class('Multiplayer.Game', Grape.Game, {
        connect: function (opts) { //todo check
            if (this._connection && this._connection.isActive()) { //living connection
                throw 'Already connected!';
            }
            this._mapper = opts.mapper || {};
            this._connection = new Connection(opts, this);
        },
        getConnection: function () {
            return this._connection;
        },
        addMessage: function (method, parameters) {
            this._connection._messageBuffer.addMessage(method, parameters);
        },
        'event frame': function () {
            if (this._connection && this._connection.isActive()) {
                this._connection._messageBuffer.flushMessages();
            }
        },
        remote: { //todo add as an implementation parameter?
            startScene: function (sceneId, sceneParameters) {
                var Scene = this._mapper.getById(sceneId);
                if (!Scene) {
                    throw 'Scene does not exist in mapper: ' + sceneId;
                }
                this.startScene(new Scene(sceneParameters));
            },
            command: function (command, instance, parameters) {
                instance[command]._original.apply(instance, parameters);
            },
            setControllable: function (instance) {
                instance.setControllable();
            },
            syncAttrs: function (instance, attributes) {
                var i;
                for (i in attributes) {
                    instance[i] = attributes[i];
                }
            }
        }
    });

    return Game;
});
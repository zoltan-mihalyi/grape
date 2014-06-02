//todo server send instance creation event to the client (e.g. New Ball({...}) ). it should use a different syncedId-like member.
define([ 'common/keywords', 'common/interfaces'], function (/*keywords, Interfaces*/) {

    var Synchronized = Grape.Class('Multiplayer.Synchronized', Grape.GameObject, {
        'event add': function (layer) {
            if (!layer._nextSyncedId) {
                layer._nextSyncedId = 1;
                layer._syncedInstances = {}; //todo on server only
            }
            this._syncedId = layer._nextSyncedId++;

            //todo on server only
            //todo removal on big map is slow
            layer._syncedInstances[this._syncedId] = this;
            this.on('remove', function () {
                delete this.getLayer()._syncedInstances[this._syncedId];
            });
        },
        'serverSide syncedAttr': function (attrs) { //todo use as prop, value
            var i, game;
            if (!this._syncedId) { //not added yet to layer
                this.on('add', function () {
                    this.syncedAttr(attrs); //we sync attrs when instance is added to the layer
                });
            } else {
                game = this.getGame(); //TODO async getGame

                if (!game) { //layer is not added to the game yet.
                    this.onGlobal('start', function () {
                        this.syncedAttr(attrs);
                    });
                } else {
                    for (i in attrs) {
                        this[i] = attrs[i];
                    }
                    game.addMessage('syncAttrs', {
                        instance: this,
                        attributes: attrs
                    });
                }
            }
        }
    });

    return Synchronized;
});
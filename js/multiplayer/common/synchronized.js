define(['common/keywords'], function (keywords) {
    var Synchronized = Grape.Class('Multiplayer.Synchronized', Grape.GameObject, {
        init: function () {
            this._dirtyAttrs = {};
            this._isDirty = false;
        },
        'event add': function (layer) {
            if (!layer._nextSyncedId) { //TODO not this way
                layer._nextSyncedId = 1;
            }
            this._syncedId = layer._nextSyncedId++;
        },
        'serverSide syncedAttr': function (attrs) { //todo use as prop, value
            console.log(attrs);
            var i;
            for (i in attrs) {
                this._dirtyAttrs[i] = attrs[i];
                this[i] = attrs[i];
                this._isDirty = true;
            }
        },
        'global-event sendMessages': function (messages) { //TODO name
            if (this._isDirty) {
                messages.sendForAll({
                    command: 'attrSync',
                    data: {id: this._syncedId, attrs: this._dirtyAttrs}
                });
                this._dirtyAttrs = {};
                this._isDirty = false;
            }
        }
    });

    return Synchronized;
});
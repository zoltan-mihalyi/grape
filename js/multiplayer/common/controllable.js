define(['common/synchronized'], function (Synchronized) {
    var Controllable = Grape.Class('Controllable', Synchronized, {
        init: function () {
            this._commands = [];
            //todo control added to someone else
            this._controller = null; //todo multiple controllers
            this._isDirtyC = false; //todo variables with same name?
        },
        addController: function (user) {
            this._controller = user; //TODO on user reconnect who is the controller? free the resource! offline user?
            this._isDirtyC = true;
        },
        'global-event sendMessages': function (messages) {
            if (this._isDirtyC) {
                messages.sendForUser(this._controller, {
                    command: 'controlAdded',
                    data: {
                        id: this._syncedId
                    }
                });
                this._isDirtyC = false;
            }
        }
    });

    return Controllable;
});
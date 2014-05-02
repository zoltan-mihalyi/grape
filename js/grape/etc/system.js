define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
    return Class('System', EventEmitter, {
        'final getLayer': function () {
            return this._layer;
        }
    });
}); //TODO move to game package
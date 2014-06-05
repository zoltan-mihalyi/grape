define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
    return Class('System', EventEmitter, {
        /* istanbul ignore next */
        'final getLayer': function () {
            return this._layer;
        }
    });
});
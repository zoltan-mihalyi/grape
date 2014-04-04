define(['core/class', 'std/event-emitter'], function (Class, EventEmitter) {
    return Class('Resource', EventEmitter, {
        'final startLoad': function () {
            var that = this;
            this.load(function (data) {
                that.emit('loaded');
            });
        },
        'abstract load': null
    });
});
define(['core/class', 'std/event-emitter'], function (Class, EventEmitter) {
    return Class('Resource', EventEmitter, {
        'final startLoad': function () {
            var that = this;
            this.load(function (data) {
                that.emit('loaded');
            });
        },
        getEstimatedTime:function(){ //TODO
            return 1;
        },
        'abstract load': null
    });
});
define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
    return Class('Resource', EventEmitter, {
        getEstimatedTime:function(){ //TODO
            return 1;
        },
        'abstract load': null
    });
});
define(['../class', '../etc/event-emitter'], function (Class, EventEmitter) {
    return Class('Resource', EventEmitter, {
        getEstimatedTime:function(){ //TODOv2
            return 1;
        },
        'abstract load': null
    });
});
define(['core/class', 'std/event-emitter'], function (Class, EventEmitter) {
    return Class('Scene', EventEmitter, {
        'event start': function (stage) {
            stage.width = 400;
            stage.height = 300;
        }
    });
});
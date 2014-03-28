define(['core/class', 'utils'], function (Class) {
    return Class('Scene', {
        'event start': function (stage) {
            stage.width = 400;
            stage.height = 300;
        }
    });
});
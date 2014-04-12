define(['core/class', 'std/layer'], function (Class, Layer) {
    //TODO JSON source
    return Class('Scene', Layer, {
        init: function () {
            this.fps = 30;
        }
    });
});
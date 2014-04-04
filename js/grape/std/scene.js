define(['core/class', 'std/layer'], function (Class, Layer) {

    return Class('Scene', Layer, {
        init: function () {
            this.width = 400;
            this.height = 300;

        },
        startScene: function (scene) {
            this.game.startScene(scene);
        }
    });
});
define(['core/class', 'std/resource/resource'], function (Class, Resource) {
    //TODO cache layer
    return Class('Sprite', Resource, {
        init: function (url, settings) {
            this.url = url;
        },

        'override load': function (onFinish, onError) {
            var that = this, img = document.createElement('img');
            img.onload = function () {
                that.width = img.width;
                that.height = img.height;
                onFinish();
            };
            //TODO onerror
            img.src = this.url;
        }
    });
});
define(['../class', './layer', './view'], function (Class, Layer, View) {
    //TODOv2 JSON source
    return Class('Scene', Layer, {
        init: function () {
            this._started = false;
            this.fps = 30;
            this.initViews();
        },
        initViews: function () {
            this.addView(new View());
        }
    });
});
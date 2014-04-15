define(['class', 'game/layer', 'game/view', 'utils'], function (Class, Layer, View, Utils) {
    //TODO JSON source
    return Class('Scene', Layer, {
        init: function () {
            this._started = false;
            this.fps = 30;
            this.initViews();
        },
        initViews: function () {
            this.addView(new View()); //todo override
        }
    });
});
define(['../class', './layer', './view'], function (Class, Layer, View) {
    //TODOv2 JSON source
    /**
     * The root layer in a game. It describes the game FPS and has a default view which can be overridden with
     * initViews.
     *
     * @class Grape.Scene
     * @uses Grape.Layer
     */
    return Class('Scene', Layer, {
        init: function () {
            this._started = false; //todov2 ??
            this.fps = 30;
            this.initViews();
        },
        /**
         * This method is called in the constructor, and adds an initial view to the scene with name 'view'. If you
         * don't want this view, you can override this method and add your own views.
         *
         * @method initViews
         */
        initViews: function () {
            this.addView('view', new View());
        }
    });
});
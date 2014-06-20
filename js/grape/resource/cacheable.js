define(['../class', './resource'], function (Class, Resource) {
    var cache = {};

    /**
     * Provides a cache feature for a resource: when a resource is loaded multiple times, the expensive operations are
     * executed only once. The resource uses the loadResource method to tell what to do when the resource should be
     * actually loaded. A typical usage is for tile maps, when multiple sprites are on the same image.
     *
     * @class Grape.Cacheable
     * @uses Grape.Resource
     * @constructor
     */
    return Class('Cacheable', Resource, { //todov2 disable cache with a property?
        'final override load': function (onFinish, onError, onProgress) {
            var key = this.getResourceKey(), that = this;
            if (cache[key]) {
                if (!this.processed) {
                    this.process(cache[key]);
                    this.processed = true;
                }
                onFinish();
            } else {
                this.loadResource(function (data) {
                    cache[key] = data;
                    that.process(data);
                    that.processed = true;
                    onFinish();
                }, onError, onProgress);
            }
        },
        /**
         * An abstract method which should return the same key when the resource is the same, it is used as cache key.
         * A typical key is the url.
         *
         * @method getResourceKey
         */
        'abstract getResourceKey': null,

        /**
         * This method is called when we want to load the resource and it is not in the cache.
         *
         * @method loadResource
         * @param {Function} onFinish Should be called when the resource is ready. The parameter is the loaded data.
         * @param {Function} onError Should be called when an error occurs
         * @param {Function} onProgress Should be called when the loading progress changes (0-100)
         */
        'abstract loadResource': null,
        /**
         * This method is called after load is called. If load is called multiple times, this method is not called more
         * than once. It should initialize the resource with the loaded data.
         *
         * @method process
         * @param (*) data The loaded data (passed to the onFinish method in loadResource
         */
        'abstract process': null
    });
});
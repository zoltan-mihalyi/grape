define(['../class', './resource'], function (Class, Resource) {
    var cache = {};

    /**
     * Provides a cache feature for a resource: when a resource is loaded multiple times, the expensive operations are
     * executed only once. The resource uses the loadResource method to tell what to do when the resource should be
     * actually loaded.
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
        //TODO doc
        'abstract getResourceKey': null,
        'abstract loadResource': null,
        'abstract process': null
    });
});
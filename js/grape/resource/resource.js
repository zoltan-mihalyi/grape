define(['../class', '../etc/event-emitter'], function (Class, EventEmitter) {
    /**
     * An abstract class to represent a resource. A resource can load itself, and can tell the estimated time to load
     * it (default:1).
     *
     * @class Grape.Resource
     * @uses Grape.EventEmitter
     */
    return Class('Resource', EventEmitter, {
        /**
         * Returns the estimated time to load the resource. Can be overridden.
         * @method getEstimatedTime
         * @return {number} The estimated time
         */
        getEstimatedTime: function () { //TODOv2
            return 1;
        },
        /**
         * Called when the resource is needed to load.
         *
         * @method load
         * @param {Function} onFinish have to be called when the resource is finished
         * @param {Function} onError have to be called when an error occurs
         * @param {Function} onProgress may be called when the progress changes (value in percent)
         */
        'abstract load': null
    });
});
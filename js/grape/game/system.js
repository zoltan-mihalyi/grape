define(['../class', '../etc/event-emitter'], function (Class, EventEmitter) {
    /**
     * A system can be added to a layer, and the layer emits all of its event to the system. The system can access the
     * layer through the getLayer method.
     *
     * @class Grape.System
     * @uses Grape.EventEmitter
     * @constructor
     */
    return Class('System', EventEmitter, {
        /* istanbul ignore next */
        /**
         * Returns the layer the system is added to.
         *
         * @method getLayer
         * @return {Grape.Layer|undefined} The layer
         */
        'final getLayer': function () {
            return this._layer;
        }
    });
});
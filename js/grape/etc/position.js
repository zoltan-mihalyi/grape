define(['../class'], function (Class) {
    /**
     * Stores x and y properties
     *
     * @class Grape.Position
     * @constructor
     * @param [opts] Options
     * @param [opts.x=0] X coordinate
     * @param [opts.y=0] Y coordinate
     */
    return Class('Position', {
        init: function (opts) {
            opts = opts || {};
            this.x = opts.x || 0;
            this.y = opts.y || 0;
        }
    });
});
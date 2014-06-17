define(['../class'], function (Class) {
    /**
     * Stores x and y properties
     *
     * @class Grape.Position
     * @constructor
     * @param {Object} [opts] Initial values of properties
     */
    return Class('Position', {
        init: function (opts) {
            opts = opts || {};
            /**
             * X coordinate
             *
             * @property x
             * @type {number}
             * @default 0
             */
            this.x = opts.x || 0;
            /**
             * Y coordinate
             *
             * @property y
             * @type {number}
             * @default 0
             */
            this.y = opts.y || 0;
        }
    });
});
define(['../class'], function (Class) {
    /**
     * An interface for axis-aligned bounding box methods
     *
     * @class Grape.AABB
     */
    return Class('AABB', {
        /**
         * Gets the left, right, top, bottom coordinates at once.
         *
         * @method getBounds
         * @abstract
         * @returns {Object} The bounding box coordinates, should contain "left", "right", "top" and "bottom" properties
         */
        'abstract getBounds': null,

        /**
         * Returns the left axis.
         *
         * @method getLeft
         * @abstract
         * @returns {number} the left axis
         */
        'abstract getLeft': null,

        /**
         * Returns the top axis.
         *
         * @method getTop
         * @abstract
         * @returns {number} the top axis
         */
        'abstract getTop': null,

        /**
         * Returns the right axis.
         *
         * @method getRight
         * @abstract
         * @returns {number} the right axis
         */
        'abstract getRight': null,

        /**
         * Returns the bottom axis.
         *
         * @method getBottom
         * @abstract
         * @returns {number} the bottom axis
         */
        'abstract getBottom': null,

        /**
         * Returns the width (right - left).
         *
         * @method getWidth
         * @abstract
         * @returns {number} the width, should be right - left
         */
        'abstract getWidth': null,

        /**
         * Returns the height (bottom - top).
         *
         * @method getHeight
         * @abstract
         * @returns {number} the height, should be bottom - top
         */
        'abstract getHeight': null
    });
});
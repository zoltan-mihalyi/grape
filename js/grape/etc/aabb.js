define(['../class'], function (Class) {
    /**
     * An interface for axis-aligned bounding box methods. All methods are abstract.
     *
     * @class Grape.AABB
     */
    return Class('AABB', {
        /**
         * Gets the left, right, top, bottom coordinates at once.
         *
         * @method getBounds
         * @return {Object} The bounding box coordinates, should contain "left", "right", "top" and "bottom" properties
         */
        'abstract getBounds': null,

        /**
         * Returns the left axis.
         *
         * @method getLeft
         * @return {number} the left axis
         */
        'abstract getLeft': null,

        /**
         * Returns the top axis.
         *
         * @method getTop
         * @return {number} the top axis
         */
        'abstract getTop': null,

        /**
         * Returns the right axis.
         *
         * @method getRight
         * @return {number} the right axis
         */
        'abstract getRight': null,

        /**
         * Returns the bottom axis.
         *
         * @method getBottom
         * @return {number} the bottom axis
         */
        'abstract getBottom': null,

        /**
         * Returns the width (right - left).
         *
         * @method getWidth
         * @return {number} the width, should be right - left
         */
        'abstract getWidth': null,

        /**
         * Returns the height (bottom - top).
         *
         * @method getHeight
         * @return {number} the height, should be bottom - top
         */
        'abstract getHeight': null
    });
});
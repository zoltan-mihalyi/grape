define([], function () {
    /**
     * Environment information
     *
     * @class Grape.Env
     * @static
     */
    return {
        /**
         * Is the current environment a browser?
         *
         * @type boolean
         * @property browser
         * @static
         */
        browser: typeof window !== 'undefined', //todo rename
        /**
         * Is the current environment node.js?
         *
         * @type boolean
         * @property node
         * @static
         */
        node: typeof process === 'object' && typeof process.env === 'object',

        /**
         * Is the current environment a touch device?
         *
         * @type boolean
         * @property touch
         * @static
         */
        touch: typeof window !=='undefined' && 'ontouchstart' in window
    };
});
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
        browser: typeof window !== 'undefined',
        /**
         * Is the current environment node.js?
         *
         * @type boolean
         * @property node
         * @static
         */
        node: typeof process === 'object' && typeof process.env === 'object'
    };
});
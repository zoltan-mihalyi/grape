/**
 * A small implementation of amd module loader, used in the built file
 */
var require, define;
(function () {
    "use strict";
    var STRING_TYPE = '[object String]';
    var defined = {};
    var waiting = {};

    var hasOwn = Object.prototype.hasOwnProperty;
    var hasProp = function (obj, prop) {
        return hasOwn.call(obj, prop);
    };

    /**
     * The define function used inside the Grape framework. You can use it to define your own modules.
     * @example
     * Grape.define('utils/isarray',['core/utils'], function(Utils){
     *      //expose to Utils namespace and returns the function.
     *      return Utils.isArray = function(target){ return Object.prototype.toString.call(target) === '[object Array]'; }
     * });
     *
     * @name define
     * @lends Grape
     * @since 0.3.2
     *
     * @param {String} name The name of the module
     * @param {String[]} deps The dependencies of the module
     * @param {Function} callback The function which defines the module (returns with the public interface). This function takes the loaded modules as parameters.
     * */
    define = function (name, deps, callback) {
        if (hasProp(defined, name) || hasProp(waiting, name)) {
            throw 'Already defined: ' + name;
        }
        waiting[name] = [deps, callback];
    };

    var loadTree = function (name) {
        var w, deps, args, i;
        if (hasProp(defined, name)) {
            return;
        }
        if (hasProp(waiting, name)) {
            w = waiting[name];
            deps = w[0];
            args = [];
            for (i = 0; i < deps.length; ++i) {
                loadTree(deps[i]);
                args[i] = defined[deps[i]];
            }
            defined[name] = w[1].apply({}, args);
        }
    };


    /**
     * The require function used inside the Grape framework. You can use it to require modules from the framework.
     *
     * @example
     * var System = Grape.require('core/system');
     * System.dispatch('mySystemEvent');
     *
     * Grape.require(['core/system', 'utils/environment'], function(System, Environment){
     *      if(Environment.browser){
     *          System.dispatch('mySystemEvent');
     *      }
     * });
     *
     * @name require
     * @lends Grape
     * @since 0.3.2
     *
     * @param {String[]} deps The dependencies of the module
     * @param {Function} [callback] The function which is loaded after the dependencies are ready. They are passed as arguments. If no callback function is defined, the require call immediately returns the module.
     * */
    require = function (deps, callback) {
        var i = 0, n, modules = [], global = (function () {
            return this;
        })();
        if (Object.prototype.toString.call(deps) == STRING_TYPE) {
            deps = [deps];
        }
        for (n = deps.length; i < n; ++i) {
            loadTree(deps[i]);
            modules[i] = defined[deps[i]];
        }
        if (callback) {
            callback.apply(global, modules);
        } else {
            return defined[deps[0]];
        }

    };
})();
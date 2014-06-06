/**
 * A small implementation of amd module loader, used in the built file
 */
var require, define;
(function () {
    "use strict";
    /*jshint -W020 */ //redefine require
    var STRING_TYPE = '[object String]';
    var defined = {};
    var waiting = {};

    var hasOwn = Object.prototype.hasOwnProperty;
    var hasProp = function (obj, prop) {
        return hasOwn.call(obj, prop);
    };
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

    require = function (deps, callback) {
        /* global originalRequire */
        var i = 0, n, modules = [], global = (function () {
            return this;
        })();
        if (Object.prototype.toString.call(deps) === STRING_TYPE) {
            deps = [deps];
        }
        for (n = deps.length; i < n; ++i) {
            loadTree(deps[i]);
            modules[i] = defined[deps[i]];
        }
        if (callback) {
            callback.apply(global, modules);
        } else {
            return defined[deps[0]] || originalRequire(deps[0]);
        }

    };
})();
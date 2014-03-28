/*! Grape.js JavaScript game engine | (c) 2014 Zoltan Mihalyi. | https://github.com/zoltan-mihalyi/grape2/blob/master/MIT-LICENSE.txt*/
/**
 * The entire Grape.js package
 */
/*global define, require*/
define(['core/main', 'std/main', 'utils'], function (Grape, Std, Utils) {
    //Strict mode does not work with getting global object
    var global = (function () {
        return this;
    })(), oldGrape = global.Grape;
    Grape.Std = Std;
    Grape.Utils = Utils;
    Grape.define = define; //add the inner define and require to the Grape namespace for third party plugins
    Grape.require = require;

    Grape.noConflict = function () {
        return oldGrape;
    };

    global.Grape = Grape;

    //node.js
    if (global.requirejsVars) {
        global.requirejsVars.define([], function () {
            return Grape;
        });
    }

    if (typeof global.define === 'function' && global.define !== define) { //if grape is built, we define it as an AMD module
        global.define([], function () {
            return Grape;
        });
    }

    return Grape;
});
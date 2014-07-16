/**
 * The global Grape object containing the built-in classes.
 *
 * @static
 * @class Grape
 */
define(['./class', './collections/main', './env', './etc/main', './game/main', './resource/main', './utils'], function (Class, Collections, Env, Etc, Game, Resource, Utils) {
    /*jslint evil: true */
    var Grape = new Function('return this')().Grape = {}; //populate to global namespace for plugins in server and client side.
    Grape.Class = Class;
    Grape.Env = Env;
    Grape.Utils = Utils;
    Grape.Object = Grape.Class(); //fake class
    Utils.extend(Grape, Collections);
    Utils.extend(Grape, Etc);
    Utils.extend(Grape, Game);
    Utils.extend(Grape, Resource);
    /**
     * The version of the current Grape library
     *
     * @static
     * @property version
     * @type {string}
     */
    Grape.version = '#VERSION#';

    //version not substituted, but we can read it from package.json
    if (typeof module !== 'undefined' && module.exports && Grape.version[0] === '#') {
        var fs = require('fs');
        try {
            Grape.version = JSON.parse(fs.readFileSync('package.json')).version;
        } catch (e) {
        }
    }

    return Grape;
});
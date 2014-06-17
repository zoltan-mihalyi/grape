/**
 * The global Grape object containing the built-in classes.
 *
 * @static
 * @class Grape
 */
define(['./class', './collections/main', './env', './etc/main', './game/main', './resource/main', './utils'], function (Class, Collections, Env, Etc, Game, Resource, Utils) {

    var Grape = {};
    Grape.Class = Class;
    Grape.Env = Env;
    Grape.Utils = Utils;
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
    Grape.version = "#VERSION#";

    return Grape;
});
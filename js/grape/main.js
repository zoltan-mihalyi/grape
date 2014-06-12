/**
 * The entire Grape.js package
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
    Grape.version="#VERSION#";

    return Grape;
});
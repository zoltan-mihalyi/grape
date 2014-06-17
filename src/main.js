/*! Grape.js JavaScript game engine | (c) 2012-2014 Zoltan Mihalyi. | https://github.com/zoltan-mihalyi/grape2/blob/master/MIT-LICENSE.txt*/
/**
 * The entire Grape.js package
 */
/*global define, require*/
define(['./class', './collections/main', './env', './etc/main', './game/main', './resource/main', './utils'], function (Class, Collections, Env, Etc, Game, Resource, Utils) {

    var Grape = {}; //todo Grape=select
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
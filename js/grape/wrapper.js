/*jshint unused:false*/ //originalRequire
(function (factory) {
    var Grape = factory(typeof require !== 'undefined' ? require : null);
    if (typeof module === "object" && typeof module.exports === "object") { //node module
        module.exports = Grape;
    } else { //global object
        this.Grape = Grape;
    }
    if (typeof define === 'function' && define.amd) { //amd module loader
        define([], function () {
            return Grape;
        });
    }
}(function (originalRequire) { //todov2 don't use this?
//#FACTORY_PLACEHOLDER#
}));

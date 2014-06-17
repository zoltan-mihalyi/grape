(function (factory) {
    var Grape = factory();
    if (typeof module === "object" && typeof module.exports === "object") { //node module
        module.exports = Grape;
    } else { //global object
        this.Grape = factory();
    }
    if (typeof define === 'function' && define.amd) { //amd module loader
        define([], function () {
            return Grape;
        });
    }
}(function () {
    //#FACTORY_PLACEHOLDER#
}));

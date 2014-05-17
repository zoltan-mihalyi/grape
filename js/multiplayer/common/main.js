define(['common/controllable', 'common/keywords', 'common/mapper','common/synchronized'], function (Controllable, keywords, Mapper, Synchronized) {
    return Grape.Multiplayer = {
        Controllable: Controllable,
        Mapper: Mapper,
        Synchronized: Synchronized
    };
});
define(['common/main', 'server/main'], function (Common, Server) {
    /*global Grape*/

    Grape.Utils.extend(Common, Server);

    return Common;
});
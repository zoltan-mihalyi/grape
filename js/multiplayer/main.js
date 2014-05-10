define(['client/main', 'common', 'server/main'], function (Client, Common, Server) {
    /*global Grape*/
    Grape.Utils.extend(Common, Client);
    Grape.Utils.extend(Common, Server);

    return Common;
});
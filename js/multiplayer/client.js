//http://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074
//terms: controllable
//lag solutions? http://en.wikipedia.org/wiki/Lag_(online_gaming)#Client-side
//syncing clients?
//what if sg should be visible for a client but not for another
//todo 'not running' error
define(['client/main', 'common/main'], function (Client, Common) {
    /*global Grape*/
    //TODO read json levels without ajax

    Grape.Utils.extend(Common, Client);

    return Common;

});
require(['grape', 'resources', 'scenes'], function (Grape, Resources, Scenes) {
    'use strict';

    //START GAME
    var pong1 = new Grape.Multiplayer.Game({
        container: 'game1'
    });
    var pong2 = new Grape.Multiplayer.Game({
        container: 'game2'
    });
    Resources.load(function () {
        pong1.start(new Scenes.MenuScene());
        pong2.start(new Scenes.MenuScene());
    });
});
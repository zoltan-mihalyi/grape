require(['grape', 'resources', 'scenes'], function (Grape, Resources, Scenes) {
    'use strict';

    //START GAME
    var pong = new Grape.Multiplayer.Game({
        container: 'game'
    });
    Resources.load(function () {
        pong.start(new Scenes.MenuScene());
    });
});
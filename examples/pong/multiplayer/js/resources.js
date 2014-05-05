define(['grape'], function (Grape) {
    'use strict';

    //DEFINE RESOURCES
    var res = new Grape.ResourceCollection({prefix: '../'});

    //-----sounds------
    res.audio('bounce', 'audio/bounce.mp3', 'audio/bounce.ogg', 'audio/bounce.wav');
    res.audio('applause', 'audio/applause.mp3');

    //-----sprites-----
    res.sprite('menubg', 'img/menubg.png');
    res.sprite('about', 'img/about.png');
    res.sprite('newgame', 'img/newgame.png');
    res.sprite('bg', 'img/bg.png');
    res.sprite('ball', 'img/ball.png', {
        originX: 12, //ball center coords
        originY: 12
    });
    return res;
});
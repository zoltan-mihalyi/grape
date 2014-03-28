requirejs.config({
    baseUrl: 'js/',
    paths: {
        'grape': '../../../js/grape/main'
    }
});
define(['grape'], function (Grape) {

    var Pong = Grape.Class('Pong', Grape.Std.Game, {
    });

    window.Pong = Pong;


    return Pong;
});
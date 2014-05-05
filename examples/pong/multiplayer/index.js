var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '../../../js/grape', //grape engine folder
    paths: {
        grape: 'main'
    }
});
requirejs(['grape'], function () {

    requirejs.config({
        baseUrl: '../../../js/multiplayer'
    });
    requirejs(['server'], function () {
        requirejs.config({
            baseUrl: './js'
        });
        requirejs(['pongserver'], function () {
        });
    });
});

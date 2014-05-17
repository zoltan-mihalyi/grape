require(['grape', 'mapper', 'resources', 'scenes'], function (Grape, Mapper, Resources, Scenes) {
    'use strict';

    var PongServer = Grape.Class('PongServer', Grape.Multiplayer.Server, {
        'event connection': function (user) {
            var users, i;
            user.addTag('WAITING');
            users = this.getUsers('WAITING');
            if (users.length === 2) {
                for (i = 0; i < users.length; i++) {
                    users[i].removeTag('WAITING');
                }
                var game = this.startGame({
                    scene: 'GameScene',
                    sceneParameters: {
                        bla: 1
                    },
                    users: users
                });
                game.scene.leftBat.setControllable(users[0]); //todo set timeout before start
                game.scene.rightBat.setControllable(users[1]);
            }
        }
    });

    //START SERVER
    Resources.load(function () {
        new PongServer({port: 8080, mapper: Mapper, server: true});
    });
});
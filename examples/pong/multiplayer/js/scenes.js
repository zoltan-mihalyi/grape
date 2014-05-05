define(['classes', 'mapper', 'grape', 'resources'], function (Classes, Mapper, Grape, Resources) {
    'use strict';

    //DEFINE SCENES
    var PongScene = Grape.Class('PongScene', Grape.Scene, {
        init: function () {
            this.width = 800;
            this.height = 600;
        }
    });

    var MenuScene = Grape.Class('MenuScene', PongScene, {
        init: function () {
            this.background = Resources.get('menubg');
            this.add(new Classes.NewGameButton({x: 64, y: 256}));
            this.add(new Classes.AboutButton({x: 64, y: 352}));
        }
    });

    var GameScene = Grape.Class('GameScene', PongScene, {
        init: function () {
            this.background = Resources.get('bg');

            this.addSystem('collision', new Grape.CollisionSystem());

            this.add(new Classes.Bat({
                x: 10,
                y: 220,
                upKey: 'w',
                downKey: 's',
                backgroundColor: 'red'
            }));
            this.add(new Classes.Bat({
                x: 766,
                y: 220,
                upKey: 'up',
                downKey: 'down',
                backgroundColor: 'green'
            }));
            this.add(new Classes.Ball({
                x: 400,
                y: 300,
                speedX: Math.random() < 0.5 ? 5 : -5,
                speedY: Math.random() < 0.5 ? 5 : -5
            }));
        },
        'event userLeft': function () { //todo
            console.log('user left!');
        },
        'event frame': function () {
            console.log('tick')
        }
    });

    //THIS IS NEW IN MULTIPLAYER

    var statusTexts = {
        0: 'Connecting',
        1: 'Open',
        2: 'Closed',
        3: 'Error'
    };

    var WaitingScene = Grape.Class('WaitingScene', PongScene, {
        init: function () {
        },
        'event start': function () {
            this.getGame().connect({address: 'localhost:8080', mapper: Mapper});
        },
        'event render': function (ctx) {
            ctx.fillText(statusTexts[this.getGame().getConnection().getStatus()], 100, 100);
        }
    });

    Mapper.GameScene = GameScene;

    return {
        PongScene: PongScene,
        MenuScene: MenuScene,
        GameScene: GameScene,
        WaitingScene: WaitingScene
    };
});
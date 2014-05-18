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

            this.leftBat = this.add(new Classes.Bat({
                x: 10,
                y: 220,
                backgroundColor: 'red'
            }));
            this.rightBat = this.add(new Classes.Bat({
                x: 766,
                y: 220,
                backgroundColor: 'green'
            }));
            this.add(new Classes.Ball({
                x: 400,
                y: 300
            }));
        },
        'event userLeft': function () { //todo
            console.log('user left!');
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
            this.getGame().connect({address: this.getGame().useHeroku?'zoltan-mihalyi.herokuapp.com':'localhost:8080', mapper: Mapper});
        },
        'event render': function (ctx) {
            ctx.fillText(statusTexts[this.getGame().getConnection().getStatus()], 100, 100);
        }
    });

    Mapper.add('GameScene', GameScene);

    return {
        PongScene: PongScene,
        MenuScene: MenuScene,
        GameScene: GameScene,
        WaitingScene: WaitingScene
    };
});
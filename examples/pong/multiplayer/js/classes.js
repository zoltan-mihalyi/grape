define(['grape', 'resources'], function (Grape, Resources) {
    'use strict';
    var Scenes; //runtime dependency
    require(['scenes'], function (S) {
        Scenes = S;
    });

    //DEFINE CLASSES
    //-----menu-----
    var MenuItem = Grape.Class('MenuItem', [Grape.Mouse, Grape.SpriteVisualizer], {
        init: function () {
            this.alpha = 0.6;
        },
        'event localPress.mouseLeft': function () {
            this.getGame().setCursor('auto');
            this.action();
        },
        'event mouseOver': function () {
            this.getGame().setCursor('pointer');
            this.alpha = 1;
        },
        'event mouseOut': function () {
            this.getGame().setCursor('auto');
            this.alpha = 0.6;
        },
        'abstract action': null
    });

    var NewGameButton = Grape.Class('NewGameButton', MenuItem, {
        init: function () {
            this.sprite = Resources.get('newgame');
        },
        action: function () {
            this.getGame().startScene(new Scenes.WaitingScene());
        }
    });

    var AboutButton = Grape.Class('AboutButton', MenuItem, {
        init: function () {
            this.sprite = Resources.get('about');
        },
        action: function () {
            alert('The Pong game implementation in Grape.js\n By Zoltan Mihalyi');
            this.getGame().input.resetKeys();
        }
    });

    //-----game-----
    var Ball = Grape.Class('Ball', [Grape.SpriteVisualizer, Grape.Collidable, Grape.Physical, Grape.Multiplayer.Synchronized], {
        init: function () {
            this.sprite = Resources.get('ball');
            this.syncedAttr({
                speedX: Math.random() < 0.5 ? 5 : -5,
                speedY: Math.random() < 0.5 ? 5 : -5
            });
        },
        'collision BAT': function () {
            this.speedX *= -1;
            this.accelerate(0.5);
            Resources.get('bounce').play();
        },
        'global-event frame': function () {
            if (this.getTop() <= 0 || this.getBottom() >= this.getScene().height) {
                this.speedY *= -1;
                Resources.get('bounce').play();
            }
            if (this.getLeft() <= 0) {
                this.handleEnd('Right player won!');
            }
            if (this.getRight() >= this.getScene().width) {
                this.handleEnd('Left player won!');
            }
        },
        'clientSide handleEnd': function (text) {
            Resources.get('applause').play();
            alert(text);
            this.getGame().input.resetKeys();
            //TODO disconnect
            this.getGame().startScene(new Scenes.MenuScene());
        },
        'serverSide handleEnd': function (text) {
            console.log(text);
            var users = this.getGame()._users;
            for (var i = 0; i < users.length; i++) {
                users[i].disconnect();
            }
            try {
                this.getGame().stop();
            }catch(e){
                console.log(users);
            }
        },
        'event frame':function(){
            this.syncedAttr({
                x:this.x,
                y:this.y
            });
        }
    });

    var Bat = Grape.Class('Bat', [Grape.Rectangle, Grape.Collidable, Grape.Multiplayer.Controllable], {
        init: function () {
            this.width = 24;
            this.height = 160;
        },
        'command up': function () { //todo validated on server or client side?
            if (this.y > 0) {
                this.y -= 10;
            }
        },
        'command down': function () {
            if (this.y + this.height < this.getScene().height) {
                this.y += 10;
            }
        },
        'event add': function () {
            this.addTag('BAT');
        },
        'event setControllable': function () {
            this.onGlobal('keyDown.up', function () {
                this.up();
            });
            this.onGlobal('keyDown.down', function () {
                this.down();
            });
        },
        'global-event render': function (ctx) {
            if (this.isControllable()) {
                ctx.beginPath();
                ctx.lineWidth = "4";
                ctx.rect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
                ctx.stroke();
            }
        }
    });

    return {
        MenuItem: MenuItem,
        NewGameButton: NewGameButton,
        AboutButton: AboutButton,
        Ball: Ball,
        Bat: Bat
    };
});
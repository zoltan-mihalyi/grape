var res = new Grape.ResourceCollection();
res.sprite('soldier', 'sprite/man.png', {
    subimages: 4
});

var MenuGui = Grape.GUIView.extend({
    'event domCreated': function (el) {
        var view = this;
        el.innerHTML = '<input type="button" class="startButton" value="Start"/>';
        el.onclick = function (e) {
            if (e.target.className === 'startButton') {
                view.getGame().startScene(new LevelScene());
            }
        };
    }
});

var ResbarGui = Grape.GUIView.extend({
    init: function () {
        this.height = 20;
        this.alpha = 0.5;
    },
    'event domCreated': function (el) {
        el.innerHTML = '<div style="background-color: brown; width: 800px;"><span class="gold"></span></div>';
        this.goldSpan = this.el.getElementsByClassName('gold')[0];
    },
    'event renderLayer': function () {
        this.goldSpan.innerHTML = this.getLayer().gold >> 0;
    }
});

var SelectionGui = Grape.GUIView.extend({
    init: function () {
        this.top = 400;
        this.height = 200;
    },
    'event domCreated': function (el) {
        el.innerHTML = '<div style="background-color: yellow; width: 800px; height: 200px" class="container"></div>';
        this.container = el.getElementsByClassName('container')[0];
    },
    'event renderLayer': function () {
        var res = '<ul>';
        this.getLayer().getByTag('SELECTED').forEach(function (unit) {
            res += '<li>' + unit.name + ' (hp: ' + unit.hp + '/' + unit.maxHp + ') ' + (unit.target ? '➜' : '') + '</li>';
        });
        res += '</ul>';
        this.container.innerHTML = res;
    }
});

var LevelScene = Grape.Scene.extend('LevelScene', {
    init: function () {
        this.gold = 1000;

        var u1 = new Soldier({x: 100, y: 200});
        var u2 = new Soldier({x: 120, y: 220});

        this.add(u1);
        this.add(u2);
        u1.addTag('MINE');
        u2.addTag('MINE');
    },
    'event render': function (ctx) {
        this.getByTag('SELECTED').forEach(function (unit, i) {
            ctx.fillStyle = 'red';
            ctx.fillRect(unit.x, unit.y - 50, 100, 10);
            ctx.fillStyle = 'green';
            ctx.fillRect(unit.x, unit.y - 50, unit.hp / unit.maxHp * 100, 10);
        });
    },
    'event keyPress.mouseRight': function () {
        var mouse = this.getSystem('view').mouse;
        if (mouse.inView) {
            this.getByTag('SELECTED').forEach(function (unit) {
                unit.target = {type: 'move', x: mouse.x, y: mouse.y};
            });
        }
    },
    'event frame': function () {
        this.gold += 0.05;
    },
    initViews: function () {
        this.addView(new ResbarGui());
        this.addView(new SelectionGui());
        this.addView('view', new Grape.View({top: 20, height: 400}));
    }
});

var MenuScene = Grape.Scene.extend({
    initViews: function () {
        this.addView(new MenuGui());
    }
});

var Unit = Grape.Class('Unit', [Grape.Mouse, Grape.SpriteVisualizer], {
    init: function () {
        this.hp = this.maxHp = 100;
        this.target = null;
    },
    'event keyPress.mouseLeft': function () {
        if (!this.getGame().input.isDown('ctrl')) { //single selection
            this.getLayer().getByTag('SELECTED').forEach(function (unit) {
                unit.removeTag('SELECTED');
            });
        }
        this.addTag('SELECTED');
    },
    'global-event frame': function () {
        if (this.target) {
            switch (this.target.type) {
                case 'move':
                    var moved = false;
                    if (Math.abs(this.x - this.target.x) > 10) {
                        this.x += 5 * (this.x > this.target.x ? -1 : 1);
                        moved = true;
                    }
                    if (Math.abs(this.y - this.target.y) > 10) {
                        this.y += 5 * (this.y > this.target.y ? -1 : 1);
                        moved = true;
                    }
                    if (!moved) {
                        this.target = null;
                    }
                    break;
            }
        }
    }
});

var Soldier = Grape.Class('Soldier', Unit, {
    init: function () {
        this.sprite = res.get('soldier');
        this.hp = 70;
    },
    name: 'Soldier'
});

res.load(function () {
    (new Grape.Game({container: 'game'})).start(new MenuScene());
});
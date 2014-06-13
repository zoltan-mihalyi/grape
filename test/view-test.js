describe('view test', function () {
    var Grape = require('grape');

    var game = {
        getScreenWidth: function () {
            return 320;
        },
        getScreenHeight: function () {
            return 240;
        },
        getScreen: function () {
            return this._screen;
        },
        _screen: document.createElement('div'),
        input: {
            mouse: {
                x: 0,
                y: 0
            }
        }
    };

    describe('abstract view test', function () {
        var View = Grape.AbstractView.extend({
            init: function () {
                this.count = 0;
            },
            'override createDom': function () {
                return document.createElement('div');
            },
            'event renderLayer': function () {
                this.el.innerHTML = 'COUNT:' + this.count;
                this.count++;
            }
        });

        it('should create and display views on the screen', function () {
            var v = new View();
            var layer = new Grape.Layer();
            layer.addView('default', v);
            layer.emit('start', game);
            expect(v.getGame()).toBe(game);
            layer.emit('renderLayer');
            expect(game.getScreen().innerHTML.indexOf('COUNT:0')).not.toBe(-1); //data appears on the screen
            layer.emit('renderLayer');
            expect(game.getScreen().innerHTML.indexOf('COUNT:1')).not.toBe(-1); //data appears on the screen
            layer.emit('stop');
            expect(game.getScreen().innerHTML.indexOf('COUNT:1')).toBe(-1); //teardown
        });

        it('should calculate dynamic properties', function () {
            var v = new View();
            var layer = new Grape.Layer();
            layer.addView(v);
            v.emit('start', game);

            var props = ['left', 'top', 'width', 'height', 'originX', 'originY'];
            var propFn = function (max) {
                return max * 0.4 + 40;
            };
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var getter = 'get' + prop.charAt(0).toUpperCase() + prop.slice(1);
                var hundredPercent;

                switch (prop) {
                    case 'left':
                    case 'width':
                        hundredPercent = game.getScreenWidth();
                        break;
                    case 'top':
                    case 'height':
                        hundredPercent = game.getScreenHeight();
                        break;
                    case 'originX':
                        hundredPercent = v.getWidth();
                        break;
                    case 'originY':
                        hundredPercent = v.getHeight();
                        break;
                }

                v[prop] = 10;
                expect(v[getter]()).toBe(10);
                v[prop] = '20';
                expect(v[getter]()).toBe(20);
                v[prop] = '30% + 30';
                expect(v[getter]()).toBe((hundredPercent * 0.3 + 30) >> 0);

                v[prop] = propFn;
                expect(v[getter]()).toBe((hundredPercent * 0.4 + 40) >> 0);
            }
        });
    });
});
//todo other view tests
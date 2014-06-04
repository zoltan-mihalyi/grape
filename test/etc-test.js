describe('alarm test', function () {
    var Grape = require('grape');

    it('should work', function () {
        var A = Grape.Alarm.extend({
            init: function () {
                this.a = 0;
                this.b = 0;
                this.x = 0;
                this.setAlarm('a', 2);
                this.setAlarm('b', 1);
            },
            'event alarm.a': function () {
                this.a++;
            },
            'event alarm.b': function () {
                this.b++;
            },
            'event alarm': function () {
                this.x++;
            }
        });

        var a = new A();

        var layer = new Grape.Layer();

        layer.add(a);
        expect(a.a + a.b + a.x).toBe(0);
        expect(a.getAlarm('a')).toBe(2);
        layer.emit('frame');
        a.increaseAlarm('c', 1);
        expect(a.getAlarm('a')).toBe(1);
        expect(a.hasAlarm('a')).toBe(true);
        expect(a.getAlarm('c')).toBe(1);
        a.increaseAlarm('c', 2);
        expect(a.getAlarm('c')).toBe(3);
        expect(a.a).toBe(0);
        expect(a.b).toBe(1);
        expect(a.x).toBe(1);
        layer.emit('frame');
        expect(a.getAlarm('a')).toBe(undefined);
        expect(a.hasAlarm('a')).toBe(false);
        expect(a.a).toBe(1);
        expect(a.b).toBe(1);
        expect(a.x).toBe(2);

    });
});


describe('animation test', function () {
    var Grape = require('grape');

    var PRECISION = 4;

    var A = Grape.Class(Grape.Animation, {
        init: function () {
            this.x = 0;
            this.imageSpeed = 0.4;
            this.sprite = {
                subimages: 3
            };
        },
        'event animationEnd': function () {
            this.x++;
        }
    });

    it('subimage changing', function () {
        var a = new A();
        var layer = new Grape.Layer();
        layer.add(a);

        expect(a.subimage).toBe(0);
        layer.emit('frame');
        expect(a.subimage).toBeCloseTo(0.4, PRECISION);
        layer.emit('frame');
        expect(a.subimage).toBeCloseTo(0.8, PRECISION);
    });

    it('animationEnd event', function () {
        var a = new A();
        var layer = new Grape.Layer();
        layer.add(a);
        a.subimage = 2.8;

        expect(a.x).toBe(0);
        layer.emit('frame');
        expect(a.x).toBe(1);
        expect(a.subimage).toBeCloseTo(0.2, PRECISION);
    });

    it('negative speed', function () {
        var a = new A();
        var layer = new Grape.Layer();
        layer.add(a);
        a.imageSpeed = -0.4;
        expect(a.x).toBe(0);
        layer.emit('frame');
        expect(a.subimage).toBeCloseTo(2.6, PRECISION);
        expect(a.x).toBe(1);

    });

    it('round speed', function () {
        var a = new A();
        var layer = new Grape.Layer();
        layer.add(a);
        a.imageSpeed = -1;

        expect(a.x).toBe(0);
        layer.emit('frame');
        expect(a.subimage).toBe(2);
        expect(a.x).toBe(1);
        a.imageSpeed = 1;
        layer.emit('frame');
        expect(a.subimage).toBe(0);
        expect(a.x).toBe(2);

    });

    it('speed>subimages', function () { //TODO

    });

    it('no sprite', function () {
        var a = new Grape.Animation(); //no sprite
        var layer = new Grape.Layer();
        layer.add(a);
        layer.emit('frame');
    });
});

describe('chainable test', function () {
    var Grape = require('grape');
    var A = Grape.Class({
        'chainable setX': function (x) {
            this.x = x;
        }
    });

    it('should work same way as the original method', function () {
        var a = new A();
        a.setX(10);
        expect(a.x).toBe(10);
    });

    it('should be chained by returning this', function () {
        var a = new A();
        expect(a.setX(10)).toBe(a);
        a.setX(20).setX(30);
        expect(a.x).toBe(30);
    });

    it('should work with finals', function () {

        var B = Grape.Class({
            'final chainable setX': function (x) {
                this.x = x;
            }
        });

        //if we extend from a class with a final method proxy, we should check overriding against the proxied method.
        B.extend();

        expect(function () {
            Grape.Class(B, {
                setX: function () {
                }
            });
        }).toThrow();
    });
});


describe('collision test', function () {
    var Grape = require('grape');

    var A = Grape.Class([Grape.Collidable, Grape.Rectangle], {
        init: function () {
            this.counter = 0;
        },
        'collision B': function () {
            this.counter++;
        }
    });

    var B = Grape.Class([Grape.Collidable, Grape.Rectangle], {
        'event add': function () {
            this.addTag('B');
        }
    });

    it('should not work without the Collision class', function () {
        expect(function () {
            Grape.Class({
                'collision X': function () {
                }
            });
        }).toThrow();
    });

    it('collision', function () {
        var a = new A({x: 10, y: 10, width: 10, height: 10});
        var b = new B({x: 10, y: 15, width: 10, height: 10});
        var layer = new Grape.Layer();
        layer.add(a);
        layer.add(b);
        layer.addSystem(new Grape.CollisionSystem());

        expect(layer.getByTag('B').length).toBe(1);

        expect(a.counter).toBe(0);
        layer.emit('frame');
        expect(a.counter).toBe(1);
    });
});
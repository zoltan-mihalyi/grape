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

describe('EventEmitter test', function () {
    var Grape = require('grape');

    it('event keyword should work only on event subclasses', function () {
        expect(function () {
            Grape.Class({
                'event a': function () {
                }
            });
        }).toThrow();
    });

    it('on off', function () {
        var e = new Grape.EventEmitter();
        var count = 0;

        function a(x) {
            count += x;
        }

        e.on('a', a);
        e.emit('a', 1);
        expect(count).toBe(1);
        e.on('a', a);
        e.emit('a', 2);
        expect(count).toBe(5); //+2*2
        e.on('a', function () {
        });
        e.off('a', a);
        e.emit('a', 3);
        expect(count).toBe(5); //no change
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
        },
        'collision C': function () {
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

    it('simple collision', function () {
        var a = new A({x: 10, y: 10, width: 10, height: 10});
        var b = new B({x: 10, y: 15, width: 10, height: 10});
        var layer = new Grape.Layer();
        layer.add(a);
        layer.add(b);
        layer.addSystem(new Grape.CollisionSystem());

        expect(a.counter).toBe(0);
        layer.emit('frame');
        expect(a.counter).toBe(1);
    });

    it('collision set in parents', function () {
        var C = A.extend({
            init: function () {
                this.counter2 = 0;
            },
            'collision B': function () {
                this.counter2++;
            }
        });

        var c = new C({x: 10, y: 10, width: 10, height: 10});
        var b = new B({x: 10, y: 15, width: 10, height: 10});
        var layer = new Grape.Layer();
        layer.add(c);
        layer.add(b);
        layer.addSystem(new Grape.CollisionSystem());

        expect(c.counter).toBe(0);
        expect(c.counter2).toBe(0);
        layer.emit('frame');
        expect(c.counter).toBe(1);
        expect(c.counter2).toBe(1);
    });

    it('multiple instances in the same grid', function () {
        var a1 = new A({x: 10, y: 10, width: 10, height: 10});
        var a2 = new A({x: 15, y: 10, width: 10, height: 10});
        var b1 = new B({x: 10, y: 15, width: 10, height: 10});
        var b2 = new B({x: 10, y: 10, width: 10, height: 125}); //grid overlapping
        var layer = new Grape.Layer();
        layer.add(a1);
        layer.add(a2);
        layer.add(b1);
        layer.add(b2);
        layer.addSystem(new Grape.CollisionSystem());

        layer.emit('frame');
        expect(a1.counter).toBe(2);
        expect(a2.counter).toBe(2);
    });

    it('corners', function () {
        var left = new A({x: 0, y: 10, width: 10, height: 10});
        var top = new A({x: 10, y: 0, width: 10, height: 10});
        var right = new A({x: 20, y: 10, width: 10, height: 10});
        var bottom = new A({x: 10, y: 20, width: 10, height: 10});
        var center = new A({x: 10, y: 10, width: 10, height: 10});
        var target = new B({x: 10, y: 10, width: 10, height: 10});
        var layer = new Grape.Layer();
        layer.add(left);
        layer.add(top);
        layer.add(right);
        layer.add(bottom);
        layer.add(center);
        layer.add(target);
        layer.addSystem(new Grape.CollisionSystem());

        layer.emit('frame');
        expect(left.counter).toBe(0);
        expect(top.counter).toBe(0);
        expect(right.counter).toBe(0);
        expect(bottom.counter).toBe(0);
        expect(center.counter).toBe(1);
    });

    it('static partition', function () {
        var a = new A({x: 10, y: 10, width: 10, height: 10});
        var b = new B({x: 10, y: 15, width: 10, height: 10});
        var layer = new Grape.Layer();
        var cs = new Grape.CollisionSystem();
        layer.addSystem(cs);
        cs.createStaticPartition(A);
        cs.createStaticPartition('B'); //no instance added when partitions created
        layer.add(a);
        layer.add(b);
        layer.emit('frame');
        expect(a.counter).toBe(0);
        cs.createStaticPartition(A);
        layer.emit('frame');
        expect(a.counter).toBe(0);
        cs.removeStaticPartition('B');
        layer.emit('frame');
        expect(a.counter).toBe(1);
        a.x += 10;
        layer.emit('frame');
        expect(a.counter).toBe(2);
        cs.removeStaticPartition(A);
        layer.emit('frame');
        expect(a.counter).toBe(2);
    });

    it('same instance, double emission', function () {
        var a = new A({x: 60, y: 60, width: 10, height: 10}); //place at grid corner
        var b = new B({x: 60, y: 60, width: 10, height: 10});
        var layer = new Grape.Layer();
        layer.add(a);
        layer.add(b);
        a.addTag('B'); //check avoid self collision
        layer.addSystem(new Grape.CollisionSystem());

        layer.emit('frame');
        expect(a.counter).toBe(1); //
    });
});

describe('Physical test', function () {
    var Grape = require('grape');

    var PRECISION = 5;

    it('test methods', function () {
        var p = new Grape.Physical();
        p.speedX = 4;
        p.speedY = 3;
        expect(p.getSpeed()).toBeCloseTo(5, PRECISION);

        p.setSpeed(0);
        expect(p.getSpeed()).toBe(0);
        expect(p.speedX).toBe(0);
        expect(p.speedY).toBe(0);
        p.setSpeed(2);
        expect(p.getSpeed()).toBeCloseTo(2, PRECISION);
        p.speedY = 1.5;
        p.accelerate(-7.5);
        expect(p.getSpeed()).toBeCloseTo(5, PRECISION);
        expect(p.speedX).toBeCloseTo(-4, PRECISION);
        expect(p.speedY).toBeCloseTo(-3, PRECISION);
    });

    it('should change position correctly each frame', function () {
        var p = new Grape.Physical({x: 10, y: 10});
        p.speedX = 2;
        p.speedY = -1;
        var layer = new Grape.Layer();
        layer.add(p);
        layer.emit('frame');
        expect(p.x).toBe(12);
        expect(p.y).toBe(9);
    });
});

describe('tag test', function () {
    var Grape = require('grape');

    it('tag add remove has', function () {
        var t1 = new Grape.Taggable();

        t1.addTag('T1');
        expect(t1.hasTag('T1')).toBe(true);
        t1.addTag('T1'); //no problem adding tag twice
        t1.removeTag('T1');
        t1.removeTag('T1'); //no problem removing not existing tag

        expect(t1.hasTag('T1')).toBe(false);
        t1.removeTagContainer(); //no problem
    });

    it('tag add remove has when added to tagContainer', function () {
        var t = new Grape.Taggable();
        var c = new Grape.TagContainer();

        t.setTagContainer(c);
        expect(c.get('T').length).toBe(0);

        t.addTag('T');
        expect(c.get('T')[0]).toBe(t);
        t.addTag('T');
        expect(c.get('T').length).toBe(1); //don't add twice
        t.removeTag('T');
        expect(c.get('T').length).toBe(0);
        t.removeTag('T'); //no problem

    });

    it('adding to tag container after tags added', function () {
        var t = new Grape.Taggable();
        var c = new Grape.TagContainer();

        t.addTag('T');
        t.addTag('Q');

        t.setTagContainer(c);
        expect(c.get('T')[0]).toBe(t);
        expect(c.get('Q')[0]).toBe(t);
    });

    it('moving between tag containers', function () {
        var t = new Grape.Taggable();
        var c1 = new Grape.TagContainer();
        var c2 = new Grape.TagContainer();

        t.setTagContainer(c1);
        t.addTag('T');
        t.setTagContainer(c2);
        expect(c1.get('T').length).toBe(0);
        expect(c2.get('T')[0]).toBe(t);

    });

    it('handling multiple tags and items', function () {
        var t1 = new Grape.Taggable();
        var t2 = new Grape.Taggable();
        var c = new Grape.TagContainer();

        t1.setTagContainer(c);
        t1.addTag('T');
        t1.addTag('T1');
        t2.setTagContainer(c);
        t2.addTag('T');
        t2.addTag('T2');

        expect(c.get('T').length).toBe(2);
        expect(c.get('T').indexOf(t1)).not.toBe(-1);
        expect(c.get('T').indexOf(t2)).not.toBe(-1);
        expect(c.get('T1')[0]).toBe(t1);
    });
});

describe('rectangle test', function () {
    //var Grape = require('grape');
    it('', function () {
        //todo
    });
});
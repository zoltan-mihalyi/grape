describe('class tests', function () {
    var Grape = require('grape');

    it('parameterization', function () {
        //name, inheritance, body with different combinations

        var Nothing = Grape.Class();
        var Name = Grape.Class('Name');
        var Inheritance = Grape.Class(Nothing);
        var Inheritance2 = Grape.Class([Nothing]);
        var NameAndInheritance = Grape.Class('NameAndInheritance', Nothing);
        var NameAndInheritance2 = Grape.Class('NameAndInheritance2', [Nothing]);
        var Body = Grape.Class({foo: 1});
        var NameAndBody = Grape.Class('NameAndBody', {foo: 2});
        var InheritanceAndBody = Grape.Class(Nothing, {foo: 3});
        var InheritanceAndBody2 = Grape.Class([Nothing], {foo: 4});
        var All = Grape.Class('All', Nothing, {foo: 5});
        var All2 = Grape.Class('All2', [Nothing], {foo: 6});

        expect(Name.className).toBe('Name');
        expect(Inheritance.inherits(Nothing)).toBe(true);
        expect(Inheritance2.inherits(Nothing)).toBe(true);
        expect(NameAndInheritance.className).toBe('NameAndInheritance');
        expect(NameAndInheritance.inherits(Nothing)).toBe(true);
        expect(NameAndInheritance2.className).toBe('NameAndInheritance2');
        expect(NameAndInheritance2.inherits(Nothing)).toBe(true);
        expect(Body.prototype.foo).toBe(1);
        expect(NameAndBody.className).toBe('NameAndBody');
        expect(NameAndBody.prototype.foo).toBe(2);
        expect(InheritanceAndBody.inherits(Nothing)).toBe(true);
        expect(InheritanceAndBody.prototype.foo).toBe(3);
        expect(InheritanceAndBody2.inherits(Nothing)).toBe(true);
        expect(InheritanceAndBody2.prototype.foo).toBe(4);
        expect(All.className).toBe('All');
        expect(All.inherits(Nothing)).toBe(true);
        expect(All.prototype.foo).toBe(5);
        expect(All2.className).toBe('All2');
        expect(All2.inherits(Nothing)).toBe(true);
        expect(All2.prototype.foo).toBe(6);
    });

    it('undefined argument', function () {
        expect(function () {
            Grape.Class('A', Grape.NotExisting, {});
        }).toThrow();

        expect(function () {
            Grape.Class([Grape.Mouse, Grape.NotExisting]);
        }).toThrow();
    });

    it('class info', function () {
        var A = Grape.Class();
        expect(A.className).not.toBeFalsy();
        expect(A.id).not.toBeFalsy();
    });

    it('class methods', function () {
        var A = Grape.Class();
        var B = Grape.Class(A);
        var C = B.extend('C', {
            foo: 1
        });
        var D = A.extend({foo: 2});

        var E = A.extend('E');

        expect(new A().getClass()).toBe(A);
        expect(A.inherits(A)).toBe(false);
        expect(A.inherits(B)).toBe(false);
        expect(B.inherits(A)).toBe(true);
        expect(new A().instanceOf(A)).toBe(true);
        expect(new B().instanceOf(A)).toBe(true);
        expect(new A().instanceOf(B)).toBe(false);

        expect(C.prototype.foo).toBe(1);
        expect(C.className).toBe('C');
        expect(C.inherits(A)).toBe(true);
        expect(D.prototype.foo).toBe(2);
        expect(D.inherits(A)).toBe(true);
        expect(E.inherits(A)).toBe(true);
        expect(E.className).toBe('E');

        expect(A + '').not.toBeFalsy(); //toString
    });

    it('method inheritance', function () {
        var A = Grape.Class({
            a: 1
        });

        var B = A.extend();
        var C = B.extend();

        var D = B.extend({
            a: 2
        });

        var E = Grape.Class([C, D]);

        expect(new B().a).toBe(1); //simple inheritance
        expect(new C().a).toBe(1); //chain inheritance
        expect(new D().a).toBe(2); //override
        expect(new E().a).toBe(2); //override by inheriting
    });

    it('init calls', function () {
        //testing order and number of init calls
        var A = Grape.Class({
            init: function () {
                this.a = 1;
                this.num = 0;
            }
        });
        var B = A.extend({
            init: function () {
                this.a = 2;
                this.num++;
            }
        });

        var C = A.extend({
            init: function () {
                this.num++;
            }
        });

        var D = Grape.Class([C, B]);
        var E = Grape.Class([B, C]);
        var F = Grape.Class([D, E]);
        var G = Grape.Class([D, E], {
            init: function () {
                this.num++;
            }
        });

        var a = new A();
        var b = new B();
        var c = new C();
        var d = new D();
        var e = new E();
        var f = new F();
        var g = new G();

        expect(b.a).toBe(2);
        expect(d.a).toBe(2);
        expect(e.a).toBe(2);

        expect(a.num).toBe(0);
        expect(b.num).toBe(1);
        expect(c.num).toBe(1);
        expect(d.num).toBe(2);
        expect(e.num).toBe(2);
        expect(f.num).toBe(2);
        expect(g.num).toBe(3);
    });

    it('modifiers', function () {

        expect(function () {
            Grape.Class({
                'final final x': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'notExisting x': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'final static x': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'final init': 1
            });
        }).toThrow();
    });

    it('static modifier', function () { //TODO
        var A = Grape.Class({
            'static A': 1
        });

        expect(A.A).toBe(1);
        expect(new A().A).toBe(undefined);
    });

    it('abstract modifier', function () {
        var A = Grape.Class({
            'abstract a': null,
            b: 1
        });

        var B = Grape.Class({
            a: 1
        });

        A.extend({ //no throw
            'abstract a': null
        });

        A.extend({ //no throw
            a: 1
        });

        Grape.Class([A, B]); //no throw

        expect(function () {
            A.extend({
                'abstract b': null
            });
        }).toThrow();

        expect(function () {
            new A();
        }).toThrow();

        expect(function () {
            A.extend();
        }).toThrow();
    });

    it('final modifier', function () {
        var A = Grape.Class({
            'final x': 1
        });

        var B = Grape.Class({
            x: 2
        });

        var C = Grape.Class(B, {
            'final x': 3
        }); //it's ok.

        var D = Grape.Class([B, A]); //override  B.x with A.x is ok.

        expect(function () {
            A.extend({
                x: 2
            });
        }).toThrow();

        expect(function () {
            A.extend({
                'final x': 2
            });
        }).toThrow();

        expect(function () {
            Grape.Class([A, B]);
        }).toThrow();

        expect(new A().x).toBe(1);
        expect(new C().x).toBe(3);
        expect(new D().x).toBe(1);
    });

    it('override modifier', function () {
        var A = Grape.Class({
            a: 1,
            b: 1
        });

        var B = Grape.Class(A, {
            'override a': 2
        });

        var C = B.extend({
            'override b': 2
        });

        expect(new B().a).toBe(2);

        expect(function () {
            A.extend({
                'override notExisting': 1
            });
        }).toThrow();

        expect(new C().b).toBe(2);
    });

    //TODO other modifiers

    it('exceptions', function () {
        var A = Grape.Class();
        var B = Grape.Class();
        var C = Grape.Class([A, B]);

        expect(function () {
            Grape.Class([A, C]);
        }).toThrow();

        expect(function () {
            Grape.Class([A, A]);
        }).toThrow();

        expect(function () {
            Grape.Class.registerKeyword('final');
        }).toThrow();

        expect(function () {
            Grape.Class({
                'static id': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'static className': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'static extend': 1
            });
        }).toThrow();

        expect(function () {
            Grape.Class({
                'getClass': 1
            });
        }).toThrow();
    });
});
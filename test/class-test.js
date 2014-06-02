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
});
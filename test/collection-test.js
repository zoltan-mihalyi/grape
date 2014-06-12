describe('collection test', function () {
    var Grape = require('grape');
    var Bag = Grape.Bag;

    describe('array test', function () {
        it('functions returning with an array', function () {
            var a = new Grape.Array();
            a.push(1);
            a.push(2);
            a.push(3);
            expect(a.map( //
                function (item) {
                    return item + 1;
                }
            ).toArray()).toEqual([2, 3, 4]);

        });

        it('extending array', function () {
            var MyArr = Grape.Array.extend();
            var a = new MyArr();
            a.push(1);
            expect(a.filter(function () {
                return true;
            }).getClass()).toBe(MyArr);
            expect(a.slice(0).getClass()).toBe(MyArr);
            expect(a.clone().getClass()).toBe(MyArr);
            expect(a.clone().toArray()).toEqual(a.toArray());
        });

        it('extra functions', function () {
            var a = new Grape.Array();

            expect(a.isEmpty()).toBe(true);
            expect(a.size()).toBe(0);
            a.push(1);
            expect(a.size()).toBe(1);
            expect(a.isEmpty()).toBe(false);
            a.push(2);
            expect(a.toArray()).toEqual([1, 2]);

            expect(a.eq(0).toArray()).toEqual([1]);
            expect(a.eq(1).toArray()).toEqual([2]);
            expect(a.eq(3).isEmpty()).toBe(true);

            expect(a.get(0)).toBe(1);
            expect(a.get(1)).toBe(2);

            expect(a.one()).toBe(1);

            expect(a.indexOf(a.random())).not.toBe(-1);
            var rnd = a.random(2).toArray();
            expect(rnd.indexOf(1) + rnd.indexOf(2)).toBe(1);
            expect(rnd.length).toBe(2);

            rnd= a.random(1).toArray();
            expect(rnd.indexOf(1) + rnd.indexOf(2)).toBe(-1); //0 + (-1)
            expect(rnd.length).toBe(1);
        });

        it('call functions', function () {
            var a = new Grape.Array();

            function f() {
            };
            var o1 = {x: f};
            var o2 = {x: f};
            var o3 = {x: f};

            spyOn(o1, 'x');
            spyOn(o2, 'x');
            spyOn(o3, 'x');

            a.push(o1);
            a.push(o2);
            a.push(o3);

            expect(a.call('x', 1, 2, 3)).toBe(a); //chainable
            expect(o1.x).toHaveBeenCalledWith(1, 2, 3);
            expect(o2.x).toHaveBeenCalledWith(1, 2, 3);
            expect(o3.x).toHaveBeenCalledWith(1, 2, 3);
            o1.x.calls.reset();
            o2.x.calls.reset();
            o3.x.calls.reset();
            expect(a.apply('x', [3, 2, 1])).toBe(a); //chainable
            expect(o1.x).toHaveBeenCalledWith(3, 2, 1);
            expect(o2.x).toHaveBeenCalledWith(3, 2, 1);
            expect(o3.x).toHaveBeenCalledWith(3, 2, 1);
        });

        it('attr', function () {
            var a = new Grape.Array();
            var o1 = {};
            var o2 = {};
            var o3 = {};
            a.push(o1);
            a.push(o2);
            a.push(o3);

            a.attr('x', 10);
            expect(o1.x).toBe(10);
            expect(o2.x).toBe(10);
            expect(o3.x).toBe(10);
        });
    });

    describe('bag test', function () {

        it('add', function () {
            var b = new Bag();
            expect(b.add('a')).toBe(1);
            b.add('b');
            expect(b.add('c')).toBe(3);

            expect(b.length).toBe(3);
        });

        it('remove', function () {
            var b = new Bag();
            b.add('a');
            expect(b.remove(0)).toBe(undefined); //only item
            expect(b.length).toBe(0);
            b.add('a');
            b.add('b');
            expect(b.remove(1)).toBe(undefined); //last item
            expect(b.length).toBe(1);
            b.add('b');
            expect(b.remove(0)).toBe('b'); //'b' was moved to the place of 'a'
            expect(b.length).toBe(1);
        });
    });
});
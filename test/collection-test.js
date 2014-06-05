describe('collection test', function () {
    var Grape = require('grape');
    var Bag = Grape.Bag;
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
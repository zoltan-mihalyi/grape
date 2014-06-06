describe('visual tests', function () {
    var Grape = require('grape');

    function expectBounding(obj, expected) {
        var bounds = obj.getBounds();
        expect(bounds).toEqual(expected);
        expect(obj.getLeft()).toBe(bounds.left);
        expect(obj.getTop()).toBe(bounds.top);
        expect(obj.getRight()).toBe(bounds.right);
        expect(obj.getBottom()).toBe(bounds.bottom);
        expect(obj.getWidth()).toBe(expected.right - expected.left);
        expect(obj.getHeight()).toBe(expected.bottom - expected.top);
    }

    describe('rectangle test', function () {
        var opts = {
            x: 10,
            y: 20,
            width: 30,
            height: 40,
            backgroundColor: 'red',
            borderColor: 'black',
            borderWidth: 2
        };

        it('bounds', function () {
            var r = new Grape.Rectangle(opts);
            expectBounding(r, {
                left: 10,
                top: 20,
                right: 40,
                bottom: 60
            });
        });

        it('default opts', function () {
            var r = new Grape.Rectangle();
            expect(r.width).toBe(0);
            expect(r.height).toBe(0);
        });

        it('render', function () {
            var r = new Grape.Rectangle(opts);
            var layer = new Grape.Layer();
            layer.add(r);

            var ctx = {};
            ctx.fillRect = jasmine.createSpy('fillRect() spy');

            layer.emit('render', ctx);
            expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 30, 40);
            expect(ctx.fillStyle).toBe('red');
            expect(ctx.borderStyle).toBe('black');
        });
    });


    describe('sprite visualizer test', function () {
        var spr = {
            left: 20,
            top: 30,
            originX: 40,
            originY: 50,
            width: 60,
            height: 70,
            leftBounding: 1,
            topBounding: 2,
            rightBounding: 63,
            bottomBounding: 74,
            subimages: 5,
            img: 'IMG'
        };

        it('render normal', function () {
            var s = new Grape.SpriteVisualizer({
                sprite: spr,
                x: 55,
                y: 63,
                alpha: 0.5,
                subimage: 2
            });
            var layer = new Grape.Layer();
            layer.add(s);

            var ctx = {};
            ctx.fillRect = jasmine.createSpy('filLRect() spy');
            ctx.fillText = jasmine.createSpy('filLText() spy');
            ctx.drawImage = jasmine.createSpy('drawImage() spy');

            layer.emit('render', ctx);

            expect(ctx.fillRect).not.toHaveBeenCalled();
            expect(ctx.fillText).not.toHaveBeenCalled();
            expect(ctx.drawImage).toHaveBeenCalledWith('IMG', 140, 30, 60, 70, 15, 13, 60, 70);
        });

        it('render without image', function () {
            var s = new Grape.SpriteVisualizer({
                x: 55,
                y: 63,
                alpha: 0.5,
                subimage: 2
            });
            var layer = new Grape.Layer();
            layer.add(s);

            var ctx = {};
            ctx.fillRect = jasmine.createSpy('filLRect() spy');
            ctx.fillText = jasmine.createSpy('filLText() spy');
            ctx.drawImage = jasmine.createSpy('drawImage() spy');

            layer.emit('render', ctx);

            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('bounds', function () {
            var s = new Grape.SpriteVisualizer({
                x: 95,
                y: 85,
                sprite: spr
            });

            expectBounding(s, {
                left: 56,
                top: 37,
                right: 118,
                bottom: 109
            });
        });
    });
});
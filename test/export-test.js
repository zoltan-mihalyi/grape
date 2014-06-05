describe('export test', function () {
    /*global Grape*/
    var Grape2 = require('grape');
    it('global namespace', function () {
        expect(Grape).toBe(Grape2);
    });
    it('noConflict', function () {
        expect(Grape.noConflict()).toBe(42); //defined in test-main.js
    });
});
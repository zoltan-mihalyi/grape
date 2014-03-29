require(['grape'], function (Grape) {
    A = Grape.Class('A', {
        'init': function (a) {
            this.asd = a;
        },
        'abstract getX': 0,
        'static asd': 12,
        'abc': function () {

        },
        'event start': function () {
        }//A
    });

    B = Grape.Class('B', A, {
        'init': function (a,b) {
            this.asd2 = b;
        },
        'override getX': function () {

        },
        'final override chainable abc': function () {
            var a = 0;
        },
        'event abc': function () {

        },
        'event start': function () {
        }//B
    });

    C = Grape.Class('C', [B], {
        'init': function () {
            this.asd3 = 1;
        }});

    X = Grape.Class('X', {
        init2: function () {
        }
    });

    Z = Grape.Class('Z', [C, X]);

    new Z().getClass();
});
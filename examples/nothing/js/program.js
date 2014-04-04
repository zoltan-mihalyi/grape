require(['grape'], function (Grape) {
    A = Grape.Class('A', Grape.Std.EventEmitter, {
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
        'init': function (a, b) {
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

    Z = Grape.Class('Z', [C, X, Grape.Std.Node]);

    new Z().getClass();


    var d1 = new Z();
    var d2 = new Z();
    var d3 = new Z();
    var d4 = new Z();
    d1.appendChild(d2);
    d1.appendChild(d3);
    d3.appendChild(d4);

    d1.on('click', function () {
        throw 'this is wrong';
    });

    d3.on('click', function (e) {
        console.log(e.button);
        e.bubble = false;
    });

    d4.emit('click', {button: 1, bubble:true});
});
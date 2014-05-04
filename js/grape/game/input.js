define(['class', 'utils'], function (Class, Utils) {
    //TODO node environment
    var KEYS = {
        any: 'any',
        none: 'none',
        mouse1: 'mouseLeft',
        mouse2: 'mouseMiddle',
        mouse3: 'mouseRight',
        8: 'backspace',
        9: 'tab',
        12: 'clear',
        13: 'enter',
        16: 'lshift',
        17: 'ctrl',
        18: 'alt',
        19: 'pause',
        20: 'rshift',
        27: 'esc',
        32: 'space',
        33: 'pagegup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete',
        91: 'windows',
        93: 'contextmenu',
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        144: 'numlock',
        186: 'é',
        187: 'ó',
        188: ',',
        189: '/',
        190: '.',
        191: 'ü',
        192: 'ö',
        219: '\u0151',
        220: '\u0171',
        221: 'ú',
        222: 'á',
        226: 'í'
    };
    var REVERSED_KEYS = {};
    var i;


    /*register letters*/
    for (i = 65; i <= 90; ++i) {
        KEYS[i] = String.fromCharCode(i).toLowerCase();
    }

    /*register digits*/
    for (i = 0; i <= 9; ++i) {
        KEYS[i + 48] = i;
    }

    /*register numpad digits*/
    for (i = 0; i <= 9; ++i) {
        KEYS[i + 96] = 'num' + i;
    }

    /*register function keys*/
    for (i = 1; i <= 12; ++i) {
        KEYS[i + 111] = 'f' + i;
    }

    /*reverse*/
    for (i in KEYS) {
        REVERSED_KEYS[KEYS[i]] = i;
    }


    function isKeyIn(key, keySet) {
        var i;
        if (key === "any" || key === "none") {
            for (i in keySet) {
                return key === "any";
            }
            return key === "none";
        }
        return keySet[REVERSED_KEYS[key]] === true;
    }

    function dispatchKeys(target, keys, prefix) {
        var keyNum = 0;
        for (var i in keys) {
            if (keyNum === 0) { //first key
                target.emit(prefix + '.any', i); //TODO {key:i}?
            }
            ++keyNum;
            target.emit(prefix + '.' + KEYS[i]);
        }
        if (keyNum === 0) {
            target.emit(prefix + '.none');
        }
    }

    if (typeof window !== 'undefined') { //todo env.browser
        Utils.addEventListener(document, 'mousemove', function (event) {
            //todo
        });
    }
    return Class('Input', {
        'static setReservedKeys': function (/*key1, key2*/) {
            //TODO reservedKeys=arguments;
        },
        init: function () {
            this.downKeys = {};
            this.pressedKeys = {};
            this.releasedKeys = {};
            this.mouse = { //TODO initial values from global ones, and global ones have to be initialized: https://forum.jquery.com/topic/is-it-possible-to-get-mouse-position-when-the-page-has-loaded-without-moving-the-mouse
                x: 0,
                y: 0,
                prevX: 0,
                prevY: 0
            };
        },
        start: function (screen) {
            var that = this;

            function down(key) {
                if (!that.downKeys[key]) {
                    that.pressedKeys[key] = true;
                }
                that.downKeys[key] = true;
                // todo preventDefault reserved keys
            }

            function up(key) {
                if (that.downKeys[key]) {
                    delete that.downKeys[key];
                    that.releasedKeys[key] = true;
                }
            }

            this.onKeyDown = function (event) {
                down(event.which);
            };
            this.onKeyUp = function (event) {
                up(event.which);
            };
            this.onContextMenu = function (event) {
                if (Utils.domContains(screen, event.target)) {
                    event.preventDefault();
                }
            };
            this.onMouseDown = function (event) {
                if (screen === event.target || Utils.domContains(screen, event.target)) {
                    down('mouse' + event.which);
                    event.preventDefault();
                }
            };
            this.onMouseUp = function (event) {
                up('mouse' + event.which);
            };
            this.onMouseMove = function (event) {
                var rect = screen.getBoundingClientRect(), current = event.target;
                that.mouse.x = event.clientX - rect.left;
                that.mouse.y = event.clientY - rect.top;
            };
            Utils.addEventListener(document, 'keydown', this.onKeyDown); //TODO to loop
            Utils.addEventListener(document, 'keyup', this.onKeyUp);
            Utils.addEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.addEventListener(document, 'mousedown', this.onMouseDown);
            Utils.addEventListener(document, 'mouseup', this.onMouseUp);
            Utils.addEventListener(document, 'mousemove', this.onMouseMove);

        },
        stop: function () {
            Utils.removeEventListener(document, 'keydown', this.onKeyDown);
            Utils.removeEventListener(document, 'keyup', this.onKeyUp);
            Utils.removeEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.removeEventListener(document, 'mousedown', this.onMouseDown);
            Utils.removeEventListener(document, 'mouseup', this.onMouseUp);
            Utils.removeEventListener(document, 'mousemove', this.onMouseMove);
        },
        emitEvents: function (target) {
            dispatchKeys(target, this.pressedKeys, 'keyPress');
            dispatchKeys(target, this.downKeys, 'keyDown');
            dispatchKeys(target, this.releasedKeys, 'keyRelease');
            if (this.mouse.prevX !== this.mouse.x || this.mouse.prevY !== this.mouse.y) {
                target.emit('mouseMove', this.mouse);
            }
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.pressedKeys = {};
            this.releasedKeys = {};
        },
        resetKeys: function () {
            this.pressedKeys = {};
            this.releasedKeys = {};
            this.downKeys = {};
        },
        isPressed: function (key) {
            return isKeyIn(key, this.pressedKeys);
        },
        isReleased: function (key) {
            return isKeyIn(key, this.releasedKeys);
        },
        isDown: function (key) {
            return isKeyIn(key, this.downKeys);
        }
    });
});
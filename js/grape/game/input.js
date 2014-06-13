define(['../class', '../env', '../utils'], function (Class, Env, Utils) {
    //TODOv2 node environment
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
    var mouseScreen = {
        x: 0,
        y: 0
    };
    //var mouseX = 0, mouseY = 0;

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
                target.emit(prefix + '.any', i);
            }
            ++keyNum;
            target.emit(prefix + '.' + KEYS[i]);
        }
        if (keyNum === 0) {
            target.emit(prefix + '.none');
        }
    }

    if (Env.browser) {
        //TODOv2 have to be initialized: https://forum.jquery.com/topic/is-it-possible-to-get-mouse-position-when-the-page-has-loaded-without-moving-the-mouse
        Utils.addEventListener(document, 'mousemove', function (event) {
            mouseScreen.x = event.clientX;
            mouseScreen.y = event.clientY;
        });
    }
    return Class('Input', {
        'static mouse': mouseScreen,
        'static setReservedKeys': function (/*key1, key2*/) {
            //TODO reservedKeys=arguments;
        },
        init: function () {
            this.downKeys = {};
            this.pressedKeys = {};
            this.releasedKeys = {};
            this.mouse = {
                x: mouseScreen.x,
                y: mouseScreen.y,
                prevX: mouseScreen.x,
                prevY: mouseScreen.y,
                screen: mouseScreen
            };
        },
        _calculateMouse: function () {
            var rect = this._screen.getBoundingClientRect();
            this.mouse.x = mouseScreen.x - rect.left;
            this.mouse.y = mouseScreen.y - rect.top;
            this.mouse.view = null;
        },
        start: function (screen) {
            var that = this;
            this._screen = screen;

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
            this._calculateMouse();
            Utils.addEventListener(document, 'keydown', this.onKeyDown); //TODOv2 to loop
            Utils.addEventListener(document, 'keyup', this.onKeyUp); //TODOv2 handle all of these globally
            Utils.addEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.addEventListener(document, 'mousedown', this.onMouseDown);
            Utils.addEventListener(document, 'mouseup', this.onMouseUp);
        },
        stop: function () {
            Utils.removeEventListener(document, 'keydown', this.onKeyDown);
            Utils.removeEventListener(document, 'keyup', this.onKeyUp);
            Utils.removeEventListener(document, 'contextmenu', this.onContextMenu);
            Utils.removeEventListener(document, 'mousedown', this.onMouseDown);
            Utils.removeEventListener(document, 'mouseup', this.onMouseUp);
        },
        emitEvents: function (target) {
            dispatchKeys(target, this.pressedKeys, 'keyPress');
            dispatchKeys(target, this.downKeys, 'keyDown');
            dispatchKeys(target, this.releasedKeys, 'keyRelease');
            this._calculateMouse();
            if (this.mouse.prevX !== this.mouse.x || this.mouse.prevY !== this.mouse.y) {
                target.emit('beforeMouseMove', this.mouse);
                target.emit('mouseMove', this.mouse);
                target.emit('afterMouseMove', this.mouse);
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
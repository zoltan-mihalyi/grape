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
    /**
     * An object which stores the mouse position relative to the page. In the most cases you want to use the instance
     * level mouse property instead.
     *
     * @property mouse
     * @static
     * @type {Object}
     */
    var mouseScreen = {
        /**
         * Mouse x relative to document.
         *
         * @property mouse.x
         * @static
         * @type Number
         */
        x: 0,
        /**
         * Mouse y relative to document.
         *
         * @property mouse.y
         * @static
         * @type Number
         */
        y: 0
    };

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

    function moved(event) {
        if ('clientX' in event) {
            mouseScreen.x = event.clientX;
            mouseScreen.y = event.clientY;
        } else if (event.touches && event.touches.length) {
            var touch = event.touches[0];
            mouseScreen.x = touch.pageX;
            mouseScreen.y = touch.pageY;
        }
        if (event.type !== 'touchend' && event.type !== 'touchstart') {
            event.preventDefault();
        }
    }

    if (Env.browser) {
        //TODOv2 have to be initialized: https://forum.jquery.com/topic/is-it-possible-to-get-mouse-position-when-the-page-has-loaded-without-moving-the-mouse
        Utils.addEventListener(document, 'mousemove', moved);
        Utils.addEventListener(document, 'touchstart', moved);
        Utils.addEventListener(document, 'touchmove', moved);
        Utils.addEventListener(document, 'touchend', moved);
    }
    /**
     * Handles which key is down, just pressed or just released in a game. A Game  Also handles mouse. The following
     * keys are available:
     *  <ul>
     *      <li><code>any</code> (matches any key)</li>
     *      <li><code>none</code></li>
     *      <li><code>mouseLeft</code></li>
     *      <li><code>mouseMiddle</code></li>
     *      <li><code>mouseRight</code></li>
     *      <li><code>a</code> ... <code>z</code> (letter keys)</li>
     *      <li><code>0</code> ... <code>9</code> (digit keys)</li>
     *      <li><code>num0</code> ... <code>num9</code> (numpad keys)</li>
     *      <li><code>f1</code> ... <code>f12</code> (function keys)</li>
     *      <li><code>backspace</code></li>
     *      <li><code>tab</code></li>
     *      <li><code>enter</code></li>
     *      <li><code>lshift</code> (left shift)</li>
     *      <li><code>rshift</code> (right shift)</li>
     *      <li><code>ctrl</code></li>
     *      <li><code>alt</code></li>
     *      <li><code>pause</code></li>
     *      <li><code>clear</code></li>
     *      <li><code>esc</code></li>
     *      <li><code>space</code></li>
     *      <li><code>pageup</code></li>
     *      <li><code>pagedown</code></li>
     *      <li><code>end</code></li>
     *      <li><code>home</code></li>
     *      <li><code>left</code></li>
     *      <li><code>right</code></li>
     *      <li><code>up</code></li>
     *      <li><code>down<</code>/li>
     *      <li><code>insert</code></li>
     *      <li><code>delete</code></li>
     *      <li><code>windows</code></li>
     *      <li><code>contextmenu</code></li>
     *      <li><code>+</code></li>
     *      <li><code>-</code></li>
     *      <li><code>*</code></li>
     *      <li><code>.</code></li>
     *      <li><code>/</code></li>
     *      <li><code>numlock</code></li>
     *  </ul>
     *
     * @class Grape.Input
     * @constructor
     * @param {Object} [opts] Options
     * @param {Array} [opts.reservedKeys] keys for which browser's default action will be prevented. The Game class
     * passes this property when instantiating the input.
     */
    return Class('Input', {
        'static mouse': mouseScreen,
        /**
         * Sets the keys which would prevent the browser's default action to be triggered.
         *
         * @method setReservedKeys
         * @param {Array} keys Key ids
         */
        setReservedKeys: function (keys) {
            var result = {},
                i, key;
            for (i = 0; i < keys.length; i++) {
                key = REVERSED_KEYS[keys[i]];
                if (!key) {
                    throw new Error('Key ' + keys[i] + ' does not exist.');
                }
                result[key] = true;
            }
            this._reservedKeys = result;
        },
        init: function (opts) {
            opts = opts || {};
            this.downKeys = {};
            this.pressedKeys = {};
            this.releasedKeys = {};
            /**
             * The x and y coordinates of the mouse relative to the game screen.
             *
             * @property mouse
             * @type {Object}
             */
            this.mouse = { //todo bad initial values?
                x: mouseScreen.x,
                y: mouseScreen.y,
                prevX: mouseScreen.x,
                prevY: mouseScreen.y,
                screen: mouseScreen
            };
            this.setReservedKeys(opts.reservedKeys || []);
        },
        _calculateMouse: function () {
            var rect, zoom;
            if (Env.browser) {
                rect = this._screen.getBoundingClientRect();
                zoom = this._screen.parentNode ? (this._screen.parentNode.style.zoom || 1) : 1;
            } else {
                rect = {
                    left: 0,
                    top: 0
                };
                zoom = 1;
            }
            this.mouse.x = mouseScreen.x / zoom - rect.left;
            this.mouse.y = mouseScreen.y / zoom - rect.top;
            this.mouse.view = null;
        },
        _start: function (screen) {
            var that = this;
            this._screen = screen;

            function down(key, event) {
                if (!that.downKeys[key]) {
                    that.pressedKeys[key] = true;
                }
                that.downKeys[key] = true;

                if (that._reservedKeys[key]) {
                    event.preventDefault();
                }
            }

            function up(key) {
                if (that.downKeys[key]) {
                    delete that.downKeys[key];
                    that.releasedKeys[key] = true;
                }
            }

            this.onKeyDown = function (event) {
                down(event.which, event);
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
                    down('mouse' + event.which, event);
                    event.preventDefault();
                }
            };
            this.onMouseUp = function (event) {
                up('mouse' + event.which);
            };
            this._calculateMouse();
            if (Env.browser) {
                Utils.addEventListener(document, 'keydown', this.onKeyDown); //TODOv2 to loop
                Utils.addEventListener(document, 'keyup', this.onKeyUp); //TODOv2 handle all of these globally
                Utils.addEventListener(document, 'contextmenu', this.onContextMenu);
                Utils.addEventListener(document, 'mousedown', this.onMouseDown);
                Utils.addEventListener(document, 'mouseup', this.onMouseUp);
            }
        },
        _stop: function () {
            if (Env.browser) {
                Utils.removeEventListener(document, 'keydown', this.onKeyDown);
                Utils.removeEventListener(document, 'keyup', this.onKeyUp);
                Utils.removeEventListener(document, 'contextmenu', this.onContextMenu);
                Utils.removeEventListener(document, 'mousedown', this.onMouseDown);
                Utils.removeEventListener(document, 'mouseup', this.onMouseUp);
            }
        },
        _emitEvents: function (target) {
            /**
             * Fires when the <key> was pressed since the last frame.
             *
             * @event keyPress.<key>
             */
            dispatchKeys(target, this.pressedKeys, 'keyPress');
            /**
             * Fires when the <key> is held in the current frame.
             *
             * @event keyDown.<key>
             */
            dispatchKeys(target, this.downKeys, 'keyDown');
            /**
             * Fires when the <key> was released since the last frame.
             *
             * @event keyRelease.<key>
             */
            dispatchKeys(target, this.releasedKeys, 'keyRelease');
            this._calculateMouse();
            if (this.mouse.prevX !== this.mouse.x || this.mouse.prevY !== this.mouse.y) {
                /**
                 * When the mouse moves, this is the first event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event beforeMouseMove
                 */
                target.emit('beforeMouseMove', this.mouse);
                /**
                 * When the mouse moves, this is the second event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event mouseMove
                 */
                target.emit('mouseMove', this.mouse);
                /**
                 * When the mouse moves, this is the third event emitted. The parameter is the mouse property of the
                 * input instance.
                 *
                 * @event afterMouseMove
                 */
                target.emit('afterMouseMove', this.mouse);
            }
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.pressedKeys = {};
            this.releasedKeys = {};
        },
        /**
         * Resets the status of the input system. Since this point all key is considered as it wasn't held. When a key
         * is released when the document is not in focus (like during an alert call), it can be used.
         *
         * @method resetKeys
         */
        resetKeys: function () {
            this.pressedKeys = {};
            this.releasedKeys = {};
            this.downKeys = {};
        },
        /**
         * Tells whether the given key was pressed since the previous frame.
         *
         * @method isPressed
         * @param {String key Key id
         * @return {Boolean} true, if the key wasn't held in the last frame but now is.
         */
        isPressed: function (key) {
            return isKeyIn(key, this.pressedKeys);
        },
        /**
         * Tells whether the given key was released since the last frame.
         *
         * @method isReleased
         * @param {String} key Key id
         * @return {Boolean} true, if the key was held in the last frame and now isn't.
         */
        isReleased: function (key) {
            return isKeyIn(key, this.releasedKeys);
        },
        /**
         * Tells whether the user is holding a key.
         *
         * @method isDown
         * @param {String} key Key id
         * @return {Boolean} true, if held.
         */
        isDown: function (key) {
            return isKeyIn(key, this.downKeys);
        }
    });
});
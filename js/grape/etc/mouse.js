define(['../class', '../game/game-object', './aabb'], function (Class, GameObject, AABB) {

    /**
     * Can decide whether the mouse is over it (in any view). If the mouse enters or leaves, mouseOver and mouseOut
     * events are emitted. When global mouse events are emitted (keyPress.mouseLeft, etc.) and the mouse is over the
     * instance, the event is emitted locally. This class works when AABB interface is implemented.
     *
     * @class Grape.Mouse
     * @uses Grape.GameObject
     * @uses Grape.AABB
     */
    return Class('Mouse', [GameObject, AABB], {
        isMouseOver: function () {
            return this._mouseOver;
        },
        'global-event beforeMouseMove': function () { //pessimistic search
            this._hasMouse = false;
        },
        'global-event mouseMoveView': function (view) {
            var bounds = this.getBounds(),
                mouse = view.mouse;
            if (mouse.x >= bounds.left && mouse.x < bounds.right && mouse.y >= bounds.top && mouse.y < bounds.bottom) {
                this._hasMouse = true;
                if (!this._mouseOver) {
                    this._mouseOver = true;
                    /**
                     * When the mouse enters, this event is emitted.
                     *
                     * @event mouseOut
                     */
                    this.emit('mouseOver');
                }
            }
        },
        'global-event afterMouseMove': function () { //if none of the view's mouse is inside the obj
            if (!this._hasMouse && this._mouseOver) {
                this._mouseOver = false;
                /**
                 * When the mouse leaves, this event is emitted.
                 *
                 * @event mouseOut
                 */
                this.emit('mouseOut');
            }
        },
        /**
         * Fires the global mouse event locally, when a global mouse event is emitted and the mouse is over the
         * instance.
         *
         * @event <mouse events>
         */
        'global-event keyPress': { //TODOv2 create with loop
            //todov2 view stores instances under mouse and emits click events
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyPress.mouseRight');
                }
            }
        },

        'global-event keyRelease': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyRelease.mouseRight');
                }
            }
        },

        'global-event keyDown': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('keyDown.mouseRight');
                }
            }
        },
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });
});
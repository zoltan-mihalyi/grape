define(['../class', '../game/game-object', './aabb'], function (Class, GameObject, AABB) {

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
                    this.emit('mouseOver');
                }
            }
        },
        'global-event afterMouseMove': function () { //if none of the view's mouse is inside the obj
            if (!this._hasMouse && this._mouseOver) {
                this._mouseOver = false;
                this.emit('mouseOut');
            }
        },
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
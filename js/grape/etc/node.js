/**
 * This class is used to represent tree-like data like DOM
 */
define(['class', 'etc/event-emitter', 'utils'], function (Class, EventEmitter, Utils) {
    return Class('Node', EventEmitter, {
        init: function () {
            this._childNodes = [];
            this._parentNode = null;
        },

        appendChild: function (child) {
            if (child._parentNode) {
                child._parentNode.removeChild(child);
            }

            child._parentNode = this;
            this._childNodes.push(child);
        },

        removeChild: function (child) {
            Utils.removeFromArray(this._childNodes, child);
            child._parentNode = null;
        },

        detach: function () {
            if (this._parentNode !== null) {
                this._parentNode.removeChild(this);
            }
        },

        indexOf: function (child) {
            return Utils.indexOf(this._childNodes, child);
        },

        nextSibling: function () {
            if (this._parentNode) {
                return null;
            }
            return this._parentNode._childNodes[this._parentNode.indexOf(this) + 1] || null;
        },

        previousSibling: function () {
            if (this._parentNode) {
                return null;
            }
            return this._parentNode._childNodes[this._parentNode.indexOf(this) - 1] || null;
        },

        'event any': function (type, payload) {
            if (this._parentNode && payload && payload.bubble) {
                this._parentNode.emit(type, payload);
            }
        }
    });
});
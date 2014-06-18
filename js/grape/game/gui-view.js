define(['../class', './abstract-view'], function (Class, AbstractView) {
    /**
     * A View which creates a simple div as view, which can be used to render real DOM elements.
     *
     * @class Grape.GUIView
     * @uses Grape.AbstractView
     * @constructor
     */
    return Class('GUIView', AbstractView, {
        createDom: function () {
            return document.createElement('div');
        }
    });
});
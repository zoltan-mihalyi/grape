define(['../class', './abstract-view'], function (Class, AbstractView) {
    return Class('GUIView', AbstractView, {
        createDom: function () {
            /*global jQuery*/
            var el = document.createElement('div');
            if (typeof jQuery !== 'undefined') {
                this.$el = jQuery(el);
            }
            return el;
        }
    });
});
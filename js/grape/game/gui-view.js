define(['class', 'game/abstract-view'], function (Class, AbstractView) {
    return Class('GUIView', AbstractView, {
        'event domCreated': function () {
            this.render();
        },
        createDom: function () {
            /*global jQuery*/
            var el = document.createElement('div');
            if (typeof jQuery !== 'undefined') {
                this.$el = jQuery(el);
            }
            return el;
        },
        render: function () {
        }
    });
});
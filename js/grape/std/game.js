define(['core/class', 'utils'], function (Class, Utils) {
    return Class('Game', {
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);

        },
        add: function (instance) {
        }
    });
});
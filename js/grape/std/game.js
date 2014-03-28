define(['core/class', 'utils'], function (Class, Utils) {
    return Class('Game', {
        start: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);


        }
    });
});
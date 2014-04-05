define(['core/class', 'utils'], function (Class, Utils) {
    return Class('Game', {
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);

        },

<<<<<<< HEAD
        add:function(instance){
=======
        add: function (instance) {
>>>>>>> b2e90f22db409471351a87c25c72c8034e3d5c30

        }
    });
});
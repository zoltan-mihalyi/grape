define(['core/class', 'utils'], function (Class, Utils) {
    return Class('Game', {
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);

        },


       'event start': function (settings) {
           this.layer=new Grape.Std.Layer();
           //this.loader
       },

        add:function(instance){

        }
    });
});
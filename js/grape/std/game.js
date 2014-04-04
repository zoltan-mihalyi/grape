define(['core/class', 'utils'], function (Class, Utils) {
    return Class('Game', {
<<<<<<< HEAD
        init:function(){
=======
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);
>>>>>>> origin/master

        },


       'event start': function (settings) {
           this.layer=new Grape.Std.Layer();
           //this.loader
       },

        add:function(instance){

        }
    });
});
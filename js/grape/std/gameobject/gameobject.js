define(['core/class'], function (Class) {
    return Class('GameObject', {
        init:function(opts){
            this.scene = opts.scene;
        }
    });
});
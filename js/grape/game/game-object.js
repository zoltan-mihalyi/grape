define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
    return Class('GameObject', EventEmitter, {
        onGlobal: function (event, handler) { //TODO global event keyword
            var that = this,
                proxy = function (payload) {
                    handler.call(that, payload);
                };
            if (this.scene) { //already added
                this.scene.on(event, proxy);
            } else {
                this.on('add', function () {
                    this.scene.on(event, proxy);
                });
            }
            this.on('remove', function () {
                this.scene.off(event, proxy)
            });
        },
        remove:function(){

        }
    });
});
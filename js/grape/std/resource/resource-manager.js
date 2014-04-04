define(['core/class', 'std/resource/sprite', 'std/event-emitter'], function (Class, Sprite, EventEmitter) {
    return Class('ResourceManager', EventEmitter, {
        init: function () {
            this.resources = [];
        },
        add: function (res) {
            this.resources.push(res);
        },
        loadAll: function () {
            var i,
                remaining = this.resources.length,
                that = this;

            function onLoad() {
                remaining--;
                that.emit('progress', (1 - remaining / that.resources.length) * 100);
                if (remaining === 0) {
                    that.emit('complete');
                }
            }

            this.emit('progress', 100);
            for (i = 0; i < this.resources.length; i++) {
                this.resources[i].load(onLoad);
            }
        },
        sprite: function (url, settings) {
            var spr = new Sprite(url, settings);
            this.resources.push(spr);
            return spr;
        }
    });
});
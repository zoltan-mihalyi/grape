define(['core/class', 'std/resource/cacheable'], function(Class, Cacheable) {
    return Class('Sprite', Cacheable, {
        init: function(url, settings) {
            settings = settings || {};
            this.url = url;
            this.width = settings.width;
            this.height = settings.height;
        },
        'override loadResource': function(onFinish, onError) {
            var img = document.createElement('img');
            img.onload = function() {
                onFinish(img);
            };
            img.onerror = function() {
                onError();
            };

            img.src = this.url;
        },
        'override getResourceKey': function() {
            return this.url;
        },
        'override process': function(img) {
            if (this.width === undefined) {
                this.width = img.width;
            }
            if (this.height === undefined) {
                this.height = img.height;
            }
        }
    });
});
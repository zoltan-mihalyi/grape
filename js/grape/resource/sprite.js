define(['class', 'resource/cacheable'], function (Class, Cacheable) {
    return Class('Sprite', Cacheable, {
        init: function (url, settings) {
            settings = settings || {};
            this.leftBounding = settings.leftBounding || 0;
            this.topBounding = settings.topBounding || 0;
            this.originX = settings.originX || 0;
            this.originY = settings.originY || 0;
            this.url = url;
            //if the following parameters are not set, they are set if the image is processed.
            this.width = settings.width;
            this.height = settings.height;
            this.rightBounding = settings.rightBounding;
            this.bottomBounding = settings.bottomBounding;
        },
        'override loadResource': function (onFinish, onError) {
            var img = document.createElement('img');
            img.onload = function () {
                setTimeout(function () {
                    onFinish(img);
                }, Math.random() * 500);
            };
            img.onerror = function () {
                onError();
            };

            img.src = this.url;
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (img) {
            this.img = img;
            if (this.width === undefined) {
                this.width = img.width;
            }
            if (this.height === undefined) {
                this.height = img.height;
            }
            if (this.rightBounding === undefined) {
                this.rightBounding = img.width;
            }
            if (this.bottomBounding === undefined) {
                this.bottomBounding = img.height;
            }
        }
    });
});
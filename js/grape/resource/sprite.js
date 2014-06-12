define(['../class', '../env', './cacheable'], function (Class, Env, Cacheable) {
    function readUInt32(data) {
        var b1, b2, b3, b4;
        b1 = data[data.pos++] << 24;
        b2 = data[data.pos++] << 16;
        b3 = data[data.pos++] << 8;
        b4 = data[data.pos++];
        return b1 | b2 | b3 | b4;
    }

    function readSection(data) {
        var i, _i, chars;
        chars = [];
        for (i = _i = 0; _i < 4; i = ++_i) {
            chars.push(String.fromCharCode(data[data.pos++]));
        }
        return chars.join('');
    }

    function getImageSize(data) {
        //TODOv2 works only for png
        var chunkSize, section;
        data.pos = 8; //TODOv2 before this should be '..PNG...'
        while (data.pos < data.length) {
            chunkSize = readUInt32(data);
            section = readSection(data);
            if (section === 'IHDR') {
                return  {
                    width: readUInt32(data),
                    height: readUInt32(data)
                };
            } else {
                data.pos += chunkSize;
            }
        }
        throw 'Failed to determine image size';
    }

    return Class('Sprite', Cacheable, {
        init: function (url, settings) {
            settings = settings || {};
            this.left = settings.left || 0;
            this.top = settings.top || 0;
            this.leftBounding = settings.leftBounding || 0;
            this.topBounding = settings.topBounding || 0;
            this.originX = settings.originX || 0;
            this.originY = settings.originY || 0;
            this.url = url;
            this.subimages = settings.subimages || 1;
            //if the following parameters are not set, they are set if the image is processed.
            this.width = settings.width;
            this.height = settings.height;
            this.rightBounding = settings.rightBounding;
            this.bottomBounding = settings.bottomBounding;
        },
        'override loadResource': function (onFinish, onError) {
            if (Env.node) {
                /*global originalRequire*/
                var fs = originalRequire('fs');
                fs.readFile(this.url, function (err, file) {
                    if (err) {
                        onError();
                    } else {
                        onFinish(getImageSize(file));
                    }
                });
            } else {
                var img = document.createElement('img');
                img.onload = function () {
                    onFinish(img);
                };
                img.onerror = function () {
                    onError();
                };

                img.src = this.url;
            }
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (img) {
            this.img = img;
            if (this.width === undefined) {
                this.width = img.width / this.subimages;
            }
            if (this.height === undefined) {
                this.height = img.height;
            }
            if (this.rightBounding === undefined) {
                this.rightBounding = this.width;
            }
            if (this.bottomBounding === undefined) {
                this.bottomBounding = this.height;
            }
        }
    });
});
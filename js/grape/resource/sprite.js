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
        throw new Error('Failed to determine image size');
    }

    /**
     * A sprite is an image or an animation. It can be defined as a part of a real image (tile sets).
     * When a sprite is an animation, the subsequent images have to be next to each other (left to right direction)
     *
     * @class Grape.Sprite
     * @uses Grape.Cacheable
     * @constructor
     * @param {String} url
     * @param {Object} opts Initial properties
     */
    return Class('Sprite', Cacheable, {
        init: function (url, opts) {
            opts = opts || {};
            /**
             * The left position of the sprite in the image.
             *
             * @property left
             * @type {Number}
             * @default 0
             */
            this.left = opts.left || 0;
            /**
             * The top position of the sprite in the image.
             *
             * @property top
             * @type {Number}
             * @default 0
             */
            this.top = opts.top || 0;
            /**
             * The left side of the sprite's bounding box
             *
             * @property leftBounding
             * @type {Number}
             * @default 0
             */
            this.leftBounding = opts.leftBounding || 0;
            /**
             * The top side of the sprite's bounding box
             *
             * @property topBounding
             * @type {Number}
             * @default 0
             */
            this.topBounding = opts.topBounding || 0;

            /**
             * The x coordinate of the sprite origin
             *
             * @property originX
             * @type {Number}
             * @default 0
             */
            this.originX = opts.originX || 0;
            /**
             * The y coordinate of the sprite origin
             *
             * @property originY
             * @type {Number}
             * @default 0
             */
            this.originY = opts.originY || 0;
            this.url = url;
            /**
             * The number of subimages (animation length). Subsequent images have to be arranged left to right.
             *
             * @property subimages
             * @type {Number}
             * @default 1
             */
            this.subimages = opts.subimages || 1;

            //if the following parameters are not set, they are set if the image is processed.
            /**
             * The width of the sprite. If not set, it will be calculated by the image width and the animation length.
             *
             * @property width
             * @type {Number}
             */
            this.width = opts.width;
            /**
             * The height of the sprite. If not set, it will be the height of the image.
             *
             * @property height
             * @type {Number}
             */
            this.height = opts.height;
            /**
             * The right side of the sprite's bounding box. If not set, it will be the image width.
             *
             * @property rightBounding
             * @type {Number}
             */
            this.rightBounding = opts.rightBounding;
            /**
             * The bottom side of the sprite's bounding box. If not set it will be the image height.
             *
             * @property bottomBounding
             * @type {Number}
             */
            this.bottomBounding = opts.bottomBounding;
        },
        'override loadResource': function (onFinish, onError) {
            if (Env.node) {
                /*global originalRequire*/
                var fs = typeof originalRequire === 'function' ? originalRequire('fs') : require('fs'); //built or not built
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
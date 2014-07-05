define(['../class', './audio', './json-scene-source', './resource', './sprite'], function (Class, GrapeAudio, JSONSceneSource, Resource, Sprite) {
    function empty() {
    }

    /**
     * Represents a collection of resources. You can add, get different kind of resources (nested collections are
     * allowed) and load resources at once.
     *
     * @class Grape.ResourceCollection
     * @uses Grape.Resource
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('ResourceCollection', Resource, {
        init: function (opts) {
            opts = opts || {};
            /**
             * When you create new items with the helpers(sprite(), audio()) this prefix is added to the url.
             * Does NOT affect resources you manually add to the collection.
             *
             * @property prefix
             * @type String
             */
            this.prefix = opts.prefix || '';
            this.resources = [];
            this.resourcesByName = {};
        },
        /**
         * Adds a new resource to the collection.
         *
         * @method add
         * @param {String} [name] The unique name of the resource
         * @param {Grape.Resource} Resource
         */
        add: function (name, res) {
            if (!res) { //no name given
                res = name;
                name = null;
            }
            if (name !== null) {
                if (this.resourcesByName[name]) {
                    throw new Error('resource with name "' + name + '" already exists.');
                }
                this.resourcesByName[name] = res;
            }
            this.resources.push(res);

        },
        /**
         * Get a previously added resource by name.
         *
         * @method get
         * @param {String} name Name
         * @return {Grape.Resource} the resource
         */
        get: function (name) {
            if (!this.resourcesByName[name]) {
                throw new Error('Resource "' + name + '" not found');
            }
            return this.resourcesByName[name];
        },
        /**
         * Loads all resources.
         *
         * @method load
         * @param {Function} onFinish Called when all resource is loaded
         * @param {Function} onError Called when an error happens
         * @param {Function} onProgress Called when a resource is loaded or progress changed
         */
        'override load': function (onFinish, onError, onProgress) {
            var i, estimated, originalTimes = [], times = [],
                estimatedTime = 0,
                remainingTime,
                hasError = false,
                remaining = this.resources.length;
            onFinish = onFinish || empty;
            onError = onError || empty;
            onProgress = onProgress || empty;

            for (i = 0; i < this.resources.length; i++) {
                estimated = this.resources[i].getEstimatedTime();
                times[i] = originalTimes[i] = estimated;
                estimatedTime += estimated;
            }
            remainingTime = estimatedTime;

            function createOnLoad(i) {
                return function () {
                    remaining--;
                    if (times[i] > 0) {
                        remainingTime -= times[i];
                        times[i] = 0;
                        onProgress((1 - remainingTime / estimatedTime) * 100);
                    }
                    if (remaining === 0) {
                        onFinish();
                    }
                };
            }

            function createOnProgress(i) {
                return function (progress) {
                    var n = originalTimes[i] * (1 - progress / 100);
                    if (times[i] !== n) {
                        remainingTime -= [times[i] - n];
                        times[i] = n;
                        onProgress((1 - remainingTime / estimatedTime) * 100);
                    }
                };
            }

            if (this.resources.length === 0) {
                onFinish();
            }

            for (i = 0; i < this.resources.length; i++) {
                /*jshint -W083 */
                this.resources[i].load(createOnLoad(i), function () {
                    if (!hasError) {
                        onError();
                        hasError = true;
                    }
                }, createOnProgress(i));
            }
        },
        /**
         * Returns the sum of the estimated time of all resource.
         *
         * @method getEstimatedTime
         * @return {Number} Sum
         */
        'override getEstimatedTime': function () {
            var i, time = 0;
            for (i = 0; i < this.resources.length; i++) {
                time += this.resources[i].getEstimatedTime();
            }
            return time;
        },
        /**
         * Creates a new sprite and adds to the collection.
         *
         * @method sprite
         * @param {String} name Key
         * @param {String} url Sprite URL
         * @param {Object} settings Settings passed to the Sprite constructor
         * @return {Grape.Sprite} The defined sprite
         */
        sprite: function (name, url, settings) {
            var spr = new Sprite(this.prefix + url, settings);
            this.add(name, spr);
            return spr;
        },
        /**
         * Creates multiple sprites and adds to the collection. The sprites should have the same dimensions.
         *
         * @method tile
         * @param {String} url Image url
         * @param {Number} width Width of all sprite
         * @param {Number} height Height of all sprite
         * @param {Object} sprites Sprite names and positions as key:[left, top, subimages] The positions array is
         * multiplied with the width and height, and the 'subimages' part is optional.
         * @return {Object} The created sprites by name
         */
        tile: function (url, width, height, sprites) {
            var i, coords, res = {};
            for (i in sprites) {
                coords = sprites[i];
                res[i] = this.sprite(i, this.prefix + url, {
                    subimages: coords.length === 2 ? 1 : coords[2],
                    left: coords[0] * width,
                    top: coords[1] * height,
                    width: width,
                    height: height
                });
            }
            return res;
        },
        /**
         * Creates an Audio resource and adds to the collection. Check Grape.Audio for more information.
         *
         * @method audio
         * @param {String} name Key
         * @param {Object} opts Audio options
         * @param {String} url1 Audio URL
         * @param {String} url2 Audio URL fallback if url1 extension is not supported
         * @param {String} url3 Audio URL fallback if url2 extension is not supported
         * @return {Grape.Audio} The Audio resource
         */
        audio: function (name, opts, url1, url2, url3) { //TODOv2 add from audio.js
            if (typeof opts === 'string') {
                url3 = url2 ? this.prefix + url2 : url2;
                url2 = url1 ? this.prefix + url1 : url1;
                url1 = opts ? this.prefix + opts : opts;
                opts = {};
            }
            var audio = new GrapeAudio(opts, url1, url2, url3);
            this.add(name, audio);
            return audio;
        },
        /**
         * Creates a new JSONSceneSource, and adds to the collection.
         *
         * @method scene
         * @param {String} name Key
         * @param {String} url Scene JSON URL
         * @param {Object} settings Settings passed as constructor parameter to JSONSceneSource.
         * @return {Grape.JSONSceneSource} The created JSONSceneSource
         */
        scene: function (name, url, settings) {
            var scn = new JSONSceneSource(this.prefix + url, settings);
            this.add(name, scn);
            return scn;
        }
    });
});
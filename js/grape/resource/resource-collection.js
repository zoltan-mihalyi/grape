define(['../class', './audio', './json-scene-source', './resource', './sprite'], function (Class, GrapeAudio, JSONSceneSource, Resource, Sprite) {
    function empty() {
    }

    return Class('ResourceCollection', Resource, {
        init: function (opts) {
            opts = opts || {};
            this.prefix = opts.prefix || '';
            this.resources = [];
            this.resourcesByName = {};
        },
        add: function (name, res) {
            if (!res) { //no name given
                res = name;
                name = null;
            }
            if (name !== null) {
                if (this.resourcesByName[name]) {
                    throw 'resource with name "' + name + '" already exists.';
                }
                this.resourcesByName[name] = res;
            }
            this.resources.push(res);

        },
        get: function (name) {
            if (!this.resourcesByName[name]) {
                throw 'Resource "' + name + '" not found';
            }
            return this.resourcesByName[name];
        },
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
        'override getEstimatedTime': function () {
            var i, time = 0;
            for (i = 0; i < this.resources.length; i++) {
                time += this.resources[i].getEstimatedTime();
            }
            return time;
        },
        sprite: function (name, url, settings) {
            var spr = new Sprite(this.prefix + url, settings);
            this.add(name, spr);
            return spr;
        },
        tile: function (url, width, height, sprites) {
            var i, coords;
            for (i in sprites) {
                coords = sprites[i];
                this.sprite(i, this.prefix + url, {
                    subimages: coords.length === 2 ? 1 : coords[2],
                    left: coords[0] * width,
                    top: coords[1] * height,
                    width: width,
                    height: height
                });
            }
        },
        audio: function (name, url, settings) {
            var audio = new GrapeAudio(this.prefix + url, settings);
            this.add(name, audio);
            return audio;
        },
        scene: function (name, url, settings) {
            var scn = new JSONSceneSource(this.prefix + url, settings);
            this.add(name, scn);
            return scn;
        }
    });
});
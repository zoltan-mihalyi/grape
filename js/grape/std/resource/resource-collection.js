define(['core/class', 'std/resource/resource', 'std/resource/sprite'], function(Class, Resource, Sprite) {
    function empty() {
    }

    return Class('ResourceCollection', Resource, {
        init: function() {
            this.resources = [];
            this.resourcesByName = {};
        },
        add: function(name, res) {
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
        'override load': function(onFinish, onError, onProgress) {
            var i,
                    hasError = false,
                    remaining = this.resources.length,
                    that = this;
            onFinish = onFinish || empty;
            onProgress = onProgress || empty;

            function onLoad() {
                remaining--;
                onProgress((1 - remaining / that.resources.length) * 100);
                if (remaining === 0) {
                    onFinish();
                }
            }
            
            if(this.resources.length===0){
                onFinish();
            }

            for (i = 0; i < this.resources.length; i++) {
                this.resources[i].load(onLoad, function() {
                    if (!hasError) {
                        onError();
                        hasError = true;
                    }
                });
            }
        },
        createLoader: function() {
            var loader = new ResourceLoader({collection: this});
            return loader;
        },
        sprite: function(name, url, settings) {
            var spr = new Sprite(url, settings);
            this.add(name, spr);
            return spr;
        },
        audio: function(name, url, settings) { //TODO
            var spr = new Sprite(url, settings);
            this.add(name, spr);
            return spr;
        }
    });
});
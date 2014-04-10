define(['core/class', 'std/resource/resource'], function(Class, Resource) {
    var cache = {};

    return Class('Cacheable', Resource, {
        'final override load': function(onFinish, onError, onProgress) {
            var key = this.getResourceKey();
            if (cache[key]) {
                if (!this.processed) {
                    this.process(cache[key]);
                    this.processed = true;
                }
                onFinish();
            } else {
                this.loadResource(function(data) {
                    cache[key] = data;
                    this.process(data);
                    this.processed = true;
                    onFinish();
                }, onError, onProgress);
            }
        },
        'abstract getResourceKey': null,
        'abstract loadResource': null,
        'abstract process': null
    });
});
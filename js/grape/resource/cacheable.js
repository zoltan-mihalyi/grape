define(['class', 'resource/resource'], function(Class, Resource) {
    var cache = {};

    return Class('Cacheable', Resource, {
        'final override load': function(onFinish, onError, onProgress) {
            var key = this.getResourceKey(), that=this;
            if (cache[key]) {
                if (!this.processed) {
                    this.process(cache[key]);
                    this.processed = true;
                }
                onFinish();
            } else {
                this.loadResource(function(data) {
                    cache[key] = data;
                    that.process(data);
                    that.processed = true;
                    onFinish();
                }, onError, onProgress);
            }
        },
        'abstract getResourceKey': null,
        'abstract loadResource': null,
        'abstract process': null
    });
});
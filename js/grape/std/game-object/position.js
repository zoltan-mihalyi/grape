define(['core/class'], function (Class) {
    return Class('Position', {
        init: function (opts) {
            opts = opts || {};
            this.x = opts.x || 0;
            this.y = opts.y || 0;
        }
    });
});
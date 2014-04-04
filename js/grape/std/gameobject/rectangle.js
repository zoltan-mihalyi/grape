define(['core/class'], function (Class) {
    return Class('Rectangle', {
        init: function (opts) {
            opts = opts || {};
            this.width = opts.width || 0;
            this.height = opts.height || 0;
            this.borderWidth = opts.borderWidth === undefined ? 1 : opts.borderWidth;
            this.backgroundColor = opts.backgroundColor || '#fff';
            this.borderColor = opts.borderColor || '#000';
        }
    });
});
define(['../class', './sprite-visualizer'], function (Class, SpriteVisualizer) {
    return Class('Animation', SpriteVisualizer, {
        init: function () {
            this.imageSpeed = 1;
        },
        'global-event frame': function () { //TODO
            if (!this.sprite) {
                return;
            }
            var subimages = this.sprite.subimages, nextSubimage = this.subimage + this.imageSpeed;
            if (nextSubimage >= subimages || nextSubimage < 0) {
                this.subimage = nextSubimage % subimages;
                if (this.subimage < 0) {
                    this.subimage += subimages;
                }
                this.emit('animationEnd');
            } else {
                this.subimage = nextSubimage;
            }
        }
    });
});
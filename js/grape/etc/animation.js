define(['class', 'resource/sprite'], function (Class, Sprite) {
    return Class('Animation', Sprite, {
        init: function () {
            this.imageSpeed = 1;
        },
        'event frame': function () {/*TODO
         var subimages = this.getSprite().subimages, nextSubimage = this.subimage + this.imageSpeed;
         if (nextSubimage >= subimages || nextSubimage < 0) {
         this.subimage = nextSubimage % subimages;
         if(this.subimage<0){
         this.subimage += subimages;
         }
         this.dispatch('animationEnd');
         } else {
         this.subimage = nextSubimage;
         }*/
        }
    });
});
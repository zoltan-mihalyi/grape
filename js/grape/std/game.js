define(['core/class','std/event-emitter', 'utils'], function (Class, EventEmitter, Utils) {
    var currentGame=null;
    
    var now=Date.now?Date.now:function(){
        return new Date().getTime();
    };
    
    return Class('Game', EventEmitter, {
        init: function (settings) {
            this.settings = Utils.extend({
                container: document.body
            }, settings);
            this.intervalId = null;

        },
        'final start': function (scene) {
            var that = this;
            if (this.isRunning()) {
                throw 'already running';
            }
            
            this.intervalId = setInterval(function () {
                currentGame=that;
//                TODO
//                var fps=200;
//                var num=0;
//                var prev=now();
//                while(now()<prev+1000/fps){
//                    
//                }
//                
                if (that.scene) {
                    
                    that.scene.emit('frame');
                    
                    that.scene.emit('render');
                }
                currentGame=null;
            }, 16);
            this.emit('start'); //TODO where should we define the starting scene?
            if(scene){
                this.startScene(scene);
            }
        },
        stop: function () {
            if (!this.isRunning()) {
                throw 'not running';
            }
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        'final isRunning': function () {
            return this.intervalId !== null;
        },
        startScene: function (scene) {
            scene.game = this;
            this.scene = scene;
            scene.emit('start', this);
        }
    });
});
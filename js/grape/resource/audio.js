define(['../class', '../env', './cacheable', '../utils'], function (Class, Env, Cacheable, Utils) {
    /*global Audio, AudioBuffer, Media, Cordova*/
    //TODOv2 partial preload for large files
    var defaultPlayOpts = {
        volume: 100
    };

    /*jshint newcap:false */
    /*global webkitAudioContext */
    var context = typeof webkitAudioContext === 'function' ? new webkitAudioContext() : null;

    var canPlay = (function () {
        var extensions, formats, i, max, canPlayTypes, audio, can;
        if (typeof Audio === 'function') {
            extensions = ['mp3', 'wav', 'ogg'];
            formats = ['audio/mpeg', 'audio/wav; codecs="1"', 'audio/ogg; codecs="vorbis"'];
            audio = new Audio();
            canPlayTypes = {};
            for (i = 0, max = extensions.length; i < max; ++i) {
                can = audio.canPlayType(formats[i]);
                if (can === 'maybe' || can === 'probably') {
                    canPlayTypes[extensions[i]] = true;
                }
            }
            return canPlayTypes;
        } else {
            return {};
        }
    })();

    function getPhoneGapPath() {
        var path = window.location.pathname;
        return 'file://' + path.substr(0, path.length - 10);
    }

    /**
     * Represents a sound. It decides from the extension of the given url which to use.
     *
     * @class Grape.Audio
     * @uses Grape.Cacheable
     */
    return Class('Audio', Cacheable, {
        init: function (opts, url1, url2, url3) {
            var url = null,
                urls, i;
            if (typeof opts === 'string') { //no opts given
                url3 = url2;
                url2 = url1;
                url1 = opts;
                opts = {}; //todov2 use
            }


            urls = [url1, url2, url3];
            for (i = 0; i < urls.length; ++i) {
                if (urls[i] && canPlay[urls[i].substring(urls[i].length - 3)]) {
                    url = urls[i];
                    break;
                }
            }
            if (url === null) {
                //TODOv2 warning None of the given formats is supported by your browser!
            }

            this.url = url;
        },
        'override loadResource': function (onFinish, onError) { //TODOv2 preload phonegap audio
            if (Env.node) {
                onFinish(null);
            } else if (location.protocol !== 'file:' && typeof Blob === 'function') { //load as blob
                Utils.ajax(this.url, {responseType: 'arraybuffer'}, function (response) {
                    if (context && typeof intel==='undefined') {
                        context.decodeAudioData(response, function (buffer) {
                            onFinish(buffer);
                        });
                    } else {
                        var blob = new Blob([response], {type: 'audio'});
                        onFinish({
                            url: URL.createObjectURL(blob),
                            blob: blob
                        });
                    }
                }, function () {
                    onError();
                });
            } else if (typeof Audio === 'function' && typeof Cordova === 'undefined') {
                //TODOv2 IE9 loads a sound multiple times
                var a = new Audio();
                a.src = this.url;
                a.addEventListener('canplaythrough', function () {
                    var arr = [];
                    arr.next = 0;
                    for (var i = 0; i < 8; ++i) {
                        arr[i] = a.cloneNode(false);
                    }
                    onFinish(arr);
                }, false);
                a.load();
            } else if (typeof Media === 'function') {
                onFinish('cordova');
            } else {
                //No audio support
                onFinish(null);
            }
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (buffer) {
            this.buffer = buffer;
        },
        /**
         * Plays the audio.
         *
         * @method play
         */
        'play': function (opts) {
            var src, snd;
            if (this.buffer === undefined) {
                throw new Error('Audio is not loaded yet.');
            }
            opts = opts || defaultPlayOpts; //TODOv2 use

            //TODOv2 separate to classes instead of instanceof
            if (this.buffer === null) { //no sound

            } else if (typeof this.buffer === 'object' && this.buffer.url) { //loading created a blob url
                snd = new Audio(this.buffer.url);
                snd.play();
            } else if (context && this.buffer instanceof AudioBuffer) {//webAudio
                src = context.createBufferSource();
                src.buffer = this.buffer;
                src.connect(context.destination);
                src.noteOn(0);
            } else if (typeof Audio === 'function' && typeof Cordova === 'undefined' && this.buffer instanceof Array) { //IE9
                snd = this.buffer[this.buffer.next++];
                if (this.buffer.next === this.buffer.length) {
                    this.buffer.next = 0;
                }
                snd.play();
            } else if (typeof Media !== 'undefined') { //Cordova
                src = getPhoneGapPath() + this.url;
                snd = new Media(src, function () {
                    snd.release();
                }, function () {
                    //TODOv2 handle error
                });
                snd.play();
            }
        }
    });
});
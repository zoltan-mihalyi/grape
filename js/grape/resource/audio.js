define(['class', 'resource/cacheable', 'utils'], function (Class, Cacheable, Utils) {
    /*global Audio, AudioBuffer, Media*/
    var defaultPlayOpts = {
        volume: 100
    };

    var context = typeof webkitAudioContext === 'function' ? new webkitAudioContext() : null;

    var canPlay = (function () {
        var extensions, formats, i, max, canPlayTypes, audio, can;
        if (true/*has audio*/) {
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

    return Class('Audio', Cacheable, {
        init: function (opts, url1, url2, url3) {
            var url = null,
                urls, i;
            if (typeof opts === 'string') { //no opts given
                url3 = url2;
                url2 = url1;
                url1 = opts;
                opts = {};
            }

            this.preloadAll = opts.preloadAll || false;

            urls = [url1, url2, url3];
            for (i = 0; i < urls.length; ++i) {
                if (urls[i] && canPlay[urls[i].substring(urls[i].length - 3)]) {
                    url = urls[i];
                    break;
                }
            }
            if (url === null) {
                throw 'None of the given formats is supported by your browser!';
            }

            this.url = url;
        },
        'override loadResource': function (onFinish, onError) { //TODO preload phonegap audio
            var a;
            if (this.preloadAll && location.protocol !== 'file:') {
                Utils.ajax(this.url, function (response) {
                    if (context) {
                        context.decodeAudioData(response, function (buffer) {
                            onFinish(buffer);
                        });
                    } else {
                        onFinish(response);
                    }
                }, function () {
                    onError();
                });
            } else if (typeof Audio === 'function') {
                a = new Audio();
                a.addEventListener('canplaythrough', function () {
                    onFinish(a);
                }, false);
                a.addEventListener('error', function () {
                    onError();
                }, false);
                a.src = this.url;
            } else {
                onFinish(null);
            }
        },
        'override getResourceKey': function () {
            return this.url;
        },
        'override process': function (buffer) {
            this.buffer = buffer;
        },
        'play': function (opts) {
            var src, snd;
            if (this.buffer === undefined) {
                throw 'Audio is not loaded yet.';
            }
            opts = opts || defaultPlayOpts; //TODO use

            //TODO separate to classes instead of instanceof
            if (typeof Audio === 'function' && this.buffer instanceof Audio) { //loading created an audio object
                snd = new Audio(this.url);
                snd.play();
            } else if (context && this.buffer instanceof AudioBuffer) {//webAudio
                src = context.createBufferSource();
                src.buffer = this.buffer;
                src.connect(context.destination);
                src.noteOn(0);
            } else if (typeof Media !== 'undefined') { //phoneGap
                src = getPhoneGapPath() + this.url;
                snd = new Media(src, function () {
                    snd.release();
                }, function () {
                    //TODO handle error
                });
                snd.play();
            }
        }
    });
});
module.exports = function (grunt) {

    var toSkip = [
        'parents',
        'allParent',
        'allParentId',
        'methodDescriptors',
        'methods',
        'ownMethods',
        'abstracts',
        'isAbstract',
        'parentFinals',
        'finals',
        'events',
        'allEvent',
        'globalEvents',
        'allGlobalEvent',
        'collisions',
        'allCollision',
        'toString',
        'className'
    ];

    function resolve(glob, path) {
        var current = glob, i;
        path = path.split('.');
        for (i = 0; i < path.length; i++) {
            current = current[path[i]];
        }
        return current;
    }

    function check(obj, path) {
        var i;
        if (obj === null || obj.__skip__) {
            return;
        }
        if (!obj.__documented__) {
            for (i = 0; i < toSkip.length; i++) {
                var skip = '.' + toSkip[i];
                if (path.indexOf(skip, path.length - skip.length) !== -1) { //ends with
                    return;
                }
            }
            throw new Error(path + ' not documented.');
        }
        console.log(path);
        obj.__skip__ = true;
        if (typeof obj === 'object') {

            if (obj.valueOf() === obj) { //not wrapped obj
                for (i in obj) {
                    if (i !== '__documented__' && i !== '__skip__') {
                        check(obj[i], path + '.' + i);
                    }
                }
            }
        } else if (typeof obj === 'function') {
            for (i in obj) {
                if (i !== '__documented__' && i !== '__skip__') {
                    check(obj[i], path + '.' + i);
                }
            }
            for (i in obj.prototype) {
                //if (i !== '__documented__' && i !== '__skip__') {
                check(obj.prototype[i], path + '#' + i);
                //}
            }
        }
    }

    grunt.registerTask('doc-coverage', function () {

        var className, realClass;
        var options = this.options({
            src: 'dist/docs'
        });

        var src = options.src + '/data.json';
        var data = grunt.file.readJSON(src);

        data.warnings.forEach(function (w) {
            grunt.log.error(JSON.stringify(w));
        });
        if (data.warnings.length) {
            throw new Error('warnings found');
        }

        var G = require('../dist/grape.js');

        var glob = {Grape: G};

        for (className in data.classes) {
            realClass = resolve(glob, className);
            if (realClass === undefined) {
                throw new Error('Doc for not existing class: ' + className);
            }
            realClass.__documented__ = true;
        }

        for (className = 0; className < data.classitems.length; ++className) {
            var item = data.classitems[className];
            var type = item.itemtype;
            realClass = resolve(glob, item.class);
            if (type === 'method') {
                var methodSource;
                if (item.static) {
                    methodSource = realClass;
                } else {
                    methodSource = realClass.prototype[item.name] ? realClass.prototype : realClass.abstracts;
                }
                if (!(item.name in methodSource)) { //undefined methods count
                    throw new Error('Doc for not existing method: ' + item.class + (item.static ? '.' : '#') + item.name);
                }
                if (!(methodSource[item.name] instanceof Object)) {
                    methodSource[item.name] = new Object(methodSource[item.name]); //wrap
                }
                methodSource[item.name].__documented__ = true;
            } else if (type === 'property' && item.static) {
                var prop = realClass[item.name];
                if (!(item.name in realClass)) { //undefined is allowed
                    throw new Error('Doc for not existing property: ' + item.class + '.' + item.name);
                }
                if (!(prop instanceof Object)) { //primitive
                    prop = realClass[item.name] = new Object(prop); //wrap
                }
                prop.__documented__ = true;
            }
        }
        check(glob.Grape, 'Grape');
    });
};
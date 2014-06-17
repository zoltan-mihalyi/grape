module.exports = function (grunt) {

    function check(doc, name, obj, errs) {
        var i;
        if (obj) {
            if (obj.___skip___) {
                return;
            }
            obj.___skip___ = true;
        }

        if (obj === null) {
            return;
        } else if (typeof obj === "object") {
            if (name) {
                console.log(name);
                if (!doc.objects[name]) {
                    errs.push('Doc missing for object"' + name + '"');
                }
            }
            for (i in obj) {
                if (i === '___skip___') {
                    continue;
                }
                check(doc, name ? name + '.' + i : i, obj[i], errs);
            }
        } else if (typeof obj === "function") {
            if (obj)
                if (doc.objects[name]) { //class
                    for (i in obj.prototype) {
                        check(doc, name + '#' + i, obj.prototype[i], errs);
                    }
                } else {
                    if (!doc.methods[name]) {
                        errs.push('Doc missing for method "' + name + '"');
                    } else {
                        if (doc.methods[name].params.length !== obj.length) {
                            errs.push('param number mismatch: ' + name);
                        }
                    }
                }


        }
    }

    grunt.registerTask('doc-coverage', function () {
        var options = this.options({
            src: 'dist/docs'
        });

        var src = options.src + '/data.json';
        var data = grunt.file.readJSON(src);

        if (data.warnings) {
            data.warnings.forEach(function (w) {
                grunt.log.error(w);
            });
            if (data.warnings.length) {
                throw new Error('warnings found');
            }
        }

        var doc = {
            objects: {},
            methods: {}
        };

        for (var i in data.classes) {
            doc.objects[i] = 1;
        }

        data.classitems.forEach(function (item) {
            if (item.itemtype === 'method') {
                if (item.static) {
                    doc.methods[item.class + '.' + item.name] = item;
                } else {
                    doc.methods[item.class + '#' + item.name] = item;
                }
            }
        });

        var G = require('../dist/grape.js');
        var errs = [];
        check(doc, null, {Grape: G}, errs);


        errs.forEach(function (err) {
            grunt.log.error(err);
        });
        if (errs.length) {
            throw new Error('errors found');
        }
    });
};
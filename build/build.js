module.exports = function (grunt) {
    var version = grunt.config('pkg.version'); //todov2 build file code quality

    function getFileName(base, name) {
        return base + '/' + name + '.js';
    }

    function depsToString(deps) {
        if (deps.length === 0) {
            return '[]';
        } else {
            return '[\'' + deps.join('\', \'') + '\']';
        }
    }

    function load(base, name, result) {
        result.loaded = result.loaded || {};
        if (typeof result.nextId === 'undefined') {
            result.nextId = 1;
        }
        if (name.indexOf('./') === 0) {
            name = name.substring(2);
            var parts = name.split('/');
            name = parts.pop();
            var pj = parts.join('/');
            if (pj !== '') {
                pj = '/' + pj;
            }
            base += pj;
        } else { //  ../
            base = base.split('/').slice(0, -1).join('/'); //remove after last /
            name = name.substring(3);
            var parts = name.split('/');
            name = parts.pop();
            var pj = parts.join('/');
            if (pj !== '') {
                pj = '/' + pj;
            }
            base += pj;
        }
        var moduleName = base + '/' + name;
        if (result.loaded[moduleName]) {
            return moduleName;
        }
        var usereq = false;
        if (!result._first) {
            usereq = true;
            result._first = true;
        }

        var deps, factory;
        var content = grunt.file.read(getFileName(base, name));
        new Function('define', content)(function (d, f) {
            deps = d;
            factory = f;
        });
        var names = [];
        for (var i = 0; i < deps.length; i++) {
            var mname = load(base, deps[i], result);
            names.push(result.loaded[mname]);
        }
        var shortName = result.useShort ? 'm' + (result.nextId++) : moduleName.substring(result.base.length + 1);
        factory = preprocess(factory + '');
        var content = 'define(\'' + shortName + '\', ' + depsToString(names) + ', ' + factory + ');';
        if (usereq) {
            result.push(content + '\nreturn require(\'' + shortName + '\');');
        } else {
            result.push(content);
        }
        result.loaded[moduleName] = shortName;
        return moduleName;
    }

    function preprocess(factory) {
        factory = factory.replace(/\#VERSION\#/g, version);
        return factory;
    }

    grunt.registerTask('build', function () {
        var options = this.options({ //todov2 move to gruntfile
            base: 'js/grape',
            name: 'main',
            amd: 'js/grape/amd.js',
            dst: 'dist/grape.js',
            wrapper: 'js/grape/wrapper.js',
            wrapperPlaceholder: '//#FACTORY_PLACEHOLDER#',
            banner: grunt.file.read('js/grape/banner.js'),
            separator: '\n',
            useShort: false
        });
        var wrapper = grunt.file.read(options.wrapper);
        var parts = wrapper.split(options.wrapperPlaceholder);
        var start = parts[0];
        var end = parts[1];
        var amd = grunt.file.read(options.amd);
        var banner = grunt.template.process(options.banner);

        var result = [];
        result.useShort = options.useShort;
        result.base = options.base;

        load(options.base, './' + options.name, result);

        grunt.file.write(options.dst, banner + '\n' + start + amd + '\n\n' + result.join(options.separator) + end);
    });
};
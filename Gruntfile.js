module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: { //todo test after build if we build
            all: {
                configFile: 'karma.conf.js',
                autoWatch: false,
                singleRun: true
            },
            continuous: {
                configFile: 'karma.conf.js',
                autoWatch: true
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'js/',
                    /*themedir: 'path/to/custom/theme/',*/
                    outdir: 'build/docs'
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "js/grape",
                    name: "amd", // using my amd implementation
                    include: ["main"], //grape
                    out: "build/grape.min.js",
                    wrap: {
                        start: '(function (originalRequire) {',
                        end: 'require("main");})(typeof require==="function"?require:null);'
                    },
                    optimize: 'uglify2',
                    logLevel: 3,
                    uglify2: {
                        output: {
                            beautify: false
                        },
                        compress: {
                            sequences: false
                        },
                        warnings: true,
                        mangle: true
                    }
                }
            }
        },
        jshint: {
            options: grunt.file.readJSON('.jshintrc'),
            uses_defaults: ['js/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'test', 'build', 'generate-docs']);

    grunt.registerTask('build', ['requirejs']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('test', ['karma:all']);
    grunt.registerTask('continuous testing', ['karma:continuous']);
    grunt.registerTask('generate-docs', ['yuidoc']);
};
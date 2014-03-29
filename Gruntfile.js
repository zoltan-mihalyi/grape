module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
//        uglify: {
//            options: {
//                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//            },
//            build: {
//                src: 'js/<%= pkg.name %>/main.js',
//                dest: 'build/<%= pkg.name %>.min.js'
//            }
//        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "js/grape",
                    //mainConfigFile: "path/to/config.js",
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
                            beautify: true
                        },
                        compress: {
                            sequences: false
                        },
                        warnings: true,
                        mangle: false
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['requirejs']);

};
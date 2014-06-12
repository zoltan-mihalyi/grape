module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    shim: {
                        grape: {
                            exports: 'Grape'
                        }
                    },
                    paths:{
                        grape:'../../../../dist/grape.min'
                    },
                    baseUrl: "js",
                    name: "../node_modules/almond/almond",
                    include: ["pong"],
                    out: "build/pong.min.js",
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
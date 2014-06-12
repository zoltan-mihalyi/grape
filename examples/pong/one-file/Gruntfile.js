module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: ".",
                    name: "../../../dist/grape.min",
                    include: ["js/pong"],
                    wrap: {
                        start: '(function(){var define=function(){};', //the project doesn't use amd, but the compiler creates define calls, we solve it this way.
                        end: '})()'
                    },
                    out: "dist/pong.min.js",
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['requirejs']);

};
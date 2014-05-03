module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['requirejs']);

};
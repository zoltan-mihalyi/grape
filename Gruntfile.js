module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: { //todo test after build if we build
            all: {
                configFile: 'karma.conf.all.js'
            },
            continuous: {
                configFile: 'karma.conf.continuous.js'
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
                    outdir: 'dist/docs'
                }
            }
        },
        jshint: {
            options: grunt.file.readJSON('.jshintrc'),
            uses_defaults: ['js/**/*.js']
        }
    });

    grunt.loadTasks('build'); //build/*

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'test', 'build', 'generate-docs']);

    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('test', ['karma:all']);
    grunt.registerTask('continuous testing', ['karma:continuous']);
    //TODO dev
    grunt.registerTask('generate-docs', ['yuidoc']);
};
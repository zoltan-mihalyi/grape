module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: { //todov2 test after build if we build
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
        },
        uglify: {
            all: {
                files: {
                    "dist/grape.min.js": [ "dist/grape.js" ]
                },
                options: {
                    preserveComments: false,
                    banner: grunt.file.read('js/grape/banner.js'),
                    sourceMap: "dist/grape.min.map",
                    sourceMappingURL: "grape.min.map",
                    report: "min",
                    beautify: {
                        ascii_only: true
                    },
                    compress: {
                        hoist_funs: false,
                        loops: false,
                        unused: false
                    }
                }
            }
        }
    });

    grunt.loadTasks('build'); //build/*

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'test', 'build', 'min', 'doc']);

    grunt.registerTask('min', ['uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('test', ['karma:all']);
    grunt.registerTask('test-dev', ['karma:continuous']);
    //TODOv2 dev
    grunt.registerTask('doc', ['yuidoc', 'doc-coverage']);
};
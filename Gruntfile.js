'use strict';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        mochaTest: {
            test: {
                src: 'tests/**/*.js',
            }
        }
    });

    grunt.task.registerTask('test', [
        'mochaTest'
    ]);
};
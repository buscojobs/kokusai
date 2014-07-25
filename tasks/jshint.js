'use strict';


module.exports = function jshint(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Options
	return {
		files: ['*.js'],
		options: {
		    jshintrc: '.jshintrc'
		}
	};
};

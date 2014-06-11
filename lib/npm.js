/*!
 * guzzle
 * Copyright(c) 2014 Lauren Smith <isfinite@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
* Module dependencies.
*/

var npm = require('npm');

/**
* Expose `Bower`.
*/

exports = module.exports = NPM;

/**
* Setup bower.
* @api public
*/

function NPM() {
	this.config = {
		'color': 'always',
		'loglevel': 'silent',
		'production': true,
		'save-dev': true
	}

	this.dependencies = {
		production: [],
		dev: ['gulp', 'gulp-clean', 'gulp-concat', 'gulp-minify-css', 'gulp-rename', 'gulp-uglify']
	}
}

NPM.prototype.run = function(callback) {
	console.log('Installing npm packages ...');

	npm.load(this.config, function(err, npm) {
		npm.install(this.dependencies.dev);
	}.bind(this));
}
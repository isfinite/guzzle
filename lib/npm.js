/*!
 * guzzle
 * Copyright(c) 2014 Lauren Smith <isfinite@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
* Module dependencies.
*/

var npm = require('npm'),
	exec = require('child_process').exec;

/**
* Expose `NPM`.
*/

exports = module.exports = NPM;

/**
* Setup NPM.
* @api public
*/

function NPM() {

	this.config = (function() {
		var _config = {
			'color': 'always',
			'loglevel': 'silent'
		}

		return {
			get: function() {
				return (_config['save'] || _config['save-dev']) ? _config : false
			},
			set: function(type) {
				if (!type) return false;
				if (type === 'dev' && _config['save']) delete _config['save'];
				if (type === 'prod' && _config['save-dev']) delete _config['save-dev'];
				_config[(type === 'dev') ? 'save-dev' : 'save'] = true;
			}
		}
	})();

	this.dependencies = {
		prod: ['connect'],
		dev: ['gulp', 'gulp-clean', 'gulp-concat', 'gulp-minify-css', 'gulp-rename', 'gulp-uglify', 'gulp-jshint']
	}
}

NPM.prototype.install = function(type, callback) {
	var _install = (function() {
		if (!this.dependencies[type].length) {
			callback && callback();
			return;
		}

		exec('npm install ' + this.dependencies[type].shift() + ' --save' + ((type === 'dev') ? '-dev' : ''), _install);
	}.bind(this));
	_install();
}

NPM.prototype.run = function(callback) {
	console.log('Installing npm packages ...');

	this.install('prod', function() {
		this.install('dev');
	}.bind(this));

}
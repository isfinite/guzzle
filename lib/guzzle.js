/*!
 * guzzle
 * Copyright(c) 2014 Lauren Smith <isfinite@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
* Module dependencies.
*/

var inquirer = require('inquirer'),
	fs = require('fs'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	prompts = require('./prompt'),
	Bower = require('./bower'),
	NPM = require('./npm');

/**
* Expose `Guzzle`.
*/

exports = module.exports = Guzzle;

/**
* Setup guzzle.
* @api public
*/

function Guzzle() {

}

Guzzle.prototype.deleteFiles = function(files, callback) {
	var totalDeleted = 0,
		totalToDelete = files.length;
	files.forEach(function(file) {
		unlink(file, function() {
			totalDeleted++;
			if (totalDeleted === totalToDelete) callback && callback();
		});
	});
}

Guzzle.prototype.writeScaffold = function(filename, ext, callback) {
	if (ext  !== 'js') {
		fs.writeFile((ext) ? filename + '.' + ext : '.' + filename, JSON.stringify(require(__dirname + '/scaffolds/' + filename)(this.data), null, 4), callback);
	} else {
		var stream = fs.createReadStream(__dirname + '/scaffolds/' + filename + '.' + ext)
			.pipe(fs.createWriteStream(process.cwd() + '/' + filename + '.' + ext));
		callback && stream.on('finish', callback);
	}
}

Guzzle.prototype.cmd = function(msg, cmd, args, verbose, callback) {
	var ls = spawn(cmd, args), timer;

	console.log(msg);

	if (!verbose) {
		timer = setInterval(function() {
			process.stdout.write('=');
		}, 100);
	}

	ls.stdout.on('data', function() {
		clearInterval(timer);
		console.log();
		callback && callback();
	});

	ls.stderr.setEncoding('utf8');
	ls.stderr.on('data', function(data) {
		process.stdout.write(data);
	})
}

Guzzle.prototype.run = function() {
	inquirer.prompt(prompts, function(data) {
		var	npm = new NPM(),
			bower = new Bower(data.bower_install);

		this.data = data;

		var writeScaffolds = function() {
			this.writeScaffold('server', 'js');
			this.writeScaffold('gulpfile', 'js');
			this.writeScaffold('package', 'json', function() {
				npm.run();
			});
		}.bind(this);

		if (data.use_testing) {
			npm.dependencies.dev.push('mocha');
			npm.dependencies.dev.push('should');
			npm.dependencies.dev.push('gulp-mocha');
			fs.mkdir('test', function() {
				fs.writeFile(process.cwd() + '/test/mocha.opts', '--reporter min\n--require should');
			});
		}

		if (data.use_browserify) {
			npm.dependencies.dev.push('vinyl-source-stream');
			npm.dependencies.dev.push('browserify');
		}

		if (data.use_bower) {
			npm.dependencies.dev.push('gulp-bower-files');

			this.writeScaffold('bower', 'json');
			this.writeScaffold('bowerrc');

			bower = new Bower(data.bower_install);
			bower.run(writeScaffolds);
		} else {
			writeScaffolds();
		}
	}.bind(this));
}
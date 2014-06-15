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
	var stream, data;

	if (ext !== 'js') {
		fs.readFile(__dirname + '/scaffolds/' + filename, { encoding: 'utf8' }, function(err, data) {
			if (data.indexOf('module.exports') !== -1) data = JSON.stringify( require(__dirname + '/scaffolds/' + filename)(this.data), null, 4 );
			fs.writeFile((ext) ? filename + '.' + ext : '.' + filename, data, callback);
		}.bind(this));
	} else {
		fs.createReadStream(__dirname + '/scaffolds/' + filename)
			.pipe(fs.createWriteStream(process.cwd() + '/' + filename + '.' + ext))
			.on('finish', callback || function() {});
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

	var prompt = function(data) {
		var	npm = new NPM(),
			bower = new Bower(data.bower_install);

		this.data = data;

		fs.mkdir('lib', function() {
			fs.mkdir('lib/js');
			fs.mkdir('lib/css');
		});

		var writeScaffolds = function() {
			var files = [
				{ name: 'server', ext: 'js' },
				{ name: 'gulpfile', ext: 'js' },
				{ name: 'package', ext: 'json', callback: function() {
					npm.run();
				}},
				{ name: 'npmignore', ext: false },
				{ name: 'gitignore', ext: false }
			];

			do {
				var file = files.shift();
				this.writeScaffold(file.name, file.ext, (file.callback) ? file.callback : null);
			} while(files.length);
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

			this.writeScaffold('bowerrc', false);
			this.writeScaffold('bower', 'json', function() {
				bower = new Bower();
				bower.packages = data.bower_install;
				bower.directory = data.bower_dir;

				bower.run(writeScaffolds);
			});
		} else {
			writeScaffolds();
		}
	}.bind(this);

	exec('ls . | wc -l', function(err, total) {
		if (total <= 0) {
			prompts.shift();
			inquirer.prompt(prompts, prompt);
		} else {
			inquirer.prompt([prompts.shift()], function(data) {
				if (data.pre_install === 'Continue') {
					inquirer.prompt(prompts, prompt);
				} else if (data.pre_install === 'Exit') {
					process.exit(1);
				} else if (data.pre_install === 'Empty directory and continue') {

				}
			});
		}
	});
}
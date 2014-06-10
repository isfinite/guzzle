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
	Bower = require('./bower');

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
		var bower;

		this.data = data;

		if (data.use_bower) {

			this.writeScaffold('bower', 'json');
			this.writeScaffold('bowerrc');

			bower = new Bower();
			bower.packages = data.bower_install;
			bower.run();
		}

		this.writeScaffold('server', 'js');
		this.writeScaffold('gulpfile', 'js');

		this.writeScaffold('package', 'json', function() {
			this.cmd('Installing node modules', 'npm', ['install'], true);
		}.bind(this));
	}.bind(this));
}
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

Guzzle.prototype.writeScaffold = function(filename, ext) {
	if (ext  !== 'js') {
		fs.writeFile((ext) ? filename + '.' + ext : '.' + filename, JSON.stringify(require('./scaffolds/' + filename)(this.data), null, 4));
	} else {
		fs.createReadStream('./scaffolds/' + filename + '.' + ext).pipe(fs.createWriteStream(process.cwd() + '/' + filename + '.' + ext));
	}
}

Guzzle.prototype.cmd = function(msg, cmd, args, callback) {
	var ls = spawn(cmd, args), timer;

	console.log(msg);

	timer = setInterval(function() {
		process.stdout.write('=');
	}, 100);

	ls.stdout.on('data', function() {
		clearInterval(timer);
		console.log();
		callback && callback();
	});

	ls.stderr.setEncoding('utf8');
	ls.stderr.on('data', function(data) {
		console.log(data);
	})
}

Guzzle.prototype.run = function() {
	inquirer.prompt(prompts, function(data) {
		var bower;

		this.data = data;

		this.writeScaffold('package', 'json');

		if (data.use_bower) {

			this.writeScaffold('bower', 'json');
			this.writeScaffold('bowerrc');

			bower = new Bower();
			bower.packages = data.bower_install;
			bower.run();
		}

		this.writeScaffold('server', 'js');
		this.writeScaffold('gulpfile', 'js');
	}.bind(this));
}
/*!
 * guzzle
 * Copyright(c) 2014 Lauren Smith <isfinite@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
* Module dependencies.
*/

var bower = require('bower');

/**
* Expose `Bower`.
*/

exports = module.exports = Bower;

/**
* Setup bower.
* @api public
*/

function Bower() {

}

Bower.prototype.run = function(callback) {
	if (!this.packages.length) return;

	bower.commands.install(this.packages, { save: true }, {});
}
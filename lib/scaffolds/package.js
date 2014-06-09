exports = module.exports = function(data) {

	var devDependencies = {
		'gulp': '^3.7.0',
		'gulp-clean': '^0.3.0',
		'gulp-concat': '^2.2.0',
		'gulp-minify-css': '^0.3.4',
		'gulp-rename': '^1.2.0',
		'gulp-uglify': '^0.3.0'
	}

	if (data.use_bower) {
		devDependencies['gulp-bower-files'] = '^0.2.4';
	}

	if (data.use_testing) {
		devDependencies['mocha'] = '^1.20.1';
		devDependencies['should'] = '^4.0.1';
		devDependencies['gulp-mocha'] = '^0.4.1';
	}

	return {
		name: data.project,
		version: data.version,
		author: {
			name: data.name,
			email: data.email
		},
		devDependencies: devDependencies,
		private: true
	}
}
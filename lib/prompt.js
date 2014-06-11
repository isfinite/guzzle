exports = module.exports = [
	{
		type: 'input',
		name: 'name',
		message: 'Your name'
	},
	{
		type: 'input',
		name: 'email',
		message: 'Your email'
	},
	{
		type: 'input',
		name: 'project',
		message: 'Project name'
	},
	{
		type: 'input',
		name: 'version',
		message: 'Version',
		default: '0.1.0'
	},
	{
		type: 'confirm',
		name: 'use_bower',
		message: 'Will you be using bower for dependency management?',
		default: true
	},
	{
		type: 'input',
		name: 'bower_dir',
		message: 'What directory would you like to use for bower packages?',
		default: 'vendor',
		when: function(answer) {
			return answer.use_bower;
		}
	},
	{
		type: 'checkbox',
		name: 'bower_install',
		message: 'Select any bower packages you would like installed automatically',
		choices: ['bootstrap', 'jquery', 'd3', 'html5-boilerplate', 'angular-latest', 'fontawesome', 'backbone', 'moment'],
		when: function(answer) {
			return answer.use_bower;
		}
	},
	{
		type: 'confirm',
		name: 'use_testing',
		message: 'Will you be doing unit testing?'
	},
	{
		type: 'confirm',
		name: 'use_browserify',
		message: 'Would you like to use browserify?'
	}
];
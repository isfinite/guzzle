exports = module.exports = function(data) {
	return {
		name: data.project,
		version: data.version,
		author: {
			name: data.name,
			email: data.email
		},
		private: true
	}
}
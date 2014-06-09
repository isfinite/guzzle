var gulp = require('gulp'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	bower = require('gulp-bower-files'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	mocha = require('gulp-mocha'),
	less = require('gulp-less'),
	minify = require('gulp-minify-css'),
	nodemon = require('gulp-nodemon'),
	source = require('vinyl-source-stream'),
	browserify = require('browserify');

var toDirName = process.env.TO_DIR_NAME || 'public',
	testDirName = process.env.TEST_DIR_NAME || 'test',
	jsFileName = process.env.JS_FILE_NAME || 'app';

gulp.task('test', function() {
	return gulp.src('./' + testDirName + '/*.js')
		.pipe(mocha({ reporter: 'min' }));
});

gulp.task('clean', ['test'], function() {
	return gulp.src('./' + toDirName, {read: false}).pipe(clean());
});

gulp.task('vendor', ['clean'], function() {
	return bower()
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('./' + toDirName + '/js'));
});

gulp.task('browserify', ['clean'], function() {
	return browserify('./lib/' + jsFileName + '.js').bundle() 
		.pipe(source('./js/' + jsFileName + '.js'))
		.pipe(gulp.dest('./' + toDirName));
});

gulp.task('concat', ['browserify', 'vendor'], function() {
	gulp.src(['./' + toDirName + '/js/vendor.js', './' + toDirName + '/js/' + jsFileName + '.js'])
		.pipe(concat(jsFileName + '.js'))
		.pipe(gulp.dest('./' + toDirName + '/js'));

	return gulp.src('./' + toDirName + '/js/' + jsFileName + '.js')
	    .pipe(gulp.dest('./' + toDirName));
});

gulp.task('copy', ['concat'], function() {
	return gulp.src('./' + toDirName + '/js/' + jsFileName + '.js')
		    .pipe(gulp.dest('./' + toDirName));
});

gulp.task('css', ['copy'], function () {
	return gulp.src('less/*.less')
		.pipe(less())
		.pipe(minify({keepBreaks:true}))
		.pipe(gulp.dest(toDirName + '/css'));
});

gulp.task('uglify', ['css'], function() {
	return gulp.src('./' + toDirName + '/' + jsFileName + '.js')
		.pipe(uglify())
		.pipe(rename(jsFileName + '.min.js'))
		.pipe(gulp.dest('./' + toDirName + '/js'));
});

gulp.task('cleanup', ['uglify'], function() {
	gulp.src('./' + toDirName + '/' + jsFileName + '.js', {read: false}).pipe(clean());
	return gulp.src('./' + toDirName + '/js/vendor.js', {read: false}).pipe(clean());
});

gulp.task('watch', function() {
	if (process.env.NODE_ENV === 'dev') return gulp.watch(['./lib/*.js', './test/*.js', './less/*.less', './*.html'], ['cleanup']);
});

gulp.task('default', ['cleanup', 'watch'], function() {
	require('child_process').exec('node server.js');
	console.log('Server started on port:8080');
});
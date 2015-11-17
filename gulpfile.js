var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');

/* ========================================
 * Configurations
 * ======================================== */
var paths = {
  scripts: [
    'bower_components/angular/angular.js',
    'src/*.js'
  ],
  sass: [
    'src/*.scss'
  ],
  css: [
  ]
};

var reload = true;
var port = 7890;

/* ========================================
 * Tasks
 * ======================================== */
gulp.task('dev:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(concat('bundle.js'))
    .pipe(connect.reload())
    .pipe(gulp.dest('assets/js'));
});

gulp.task('dev:sass', function () {
  return gulp.src(paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('all.css'))
    .pipe(connect.reload())
    .pipe(gulp.dest('assets/css'));
});

gulp.task('css', function () {
  return gulp.src(paths.css) 
    .pipe(concat('main.css'))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('connect', function () {
  connect.server({
    port: port, 
    root: [__dirname],
    livereload: reload
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['dev:scripts']);
  gulp.watch(paths.sass, ['dev:sass']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('dist:clean', function () {
  return del(['dist']);
});

gulp.task('dist', ['dist:clean'], function () {
  gulp.src('src/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat('yt-tooltip.min.css'))
    .pipe(gulp.dest('dist/'));
  gulp.src('src/*.scss')
    .pipe(sass())
    .pipe(concat('yt-tooltip.css'))
    .pipe(gulp.dest('dist/'));

  gulp.src('src/*.js')
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(concat('yt-tooltip.min.js'))
    .pipe(gulp.dest('dist/'));

  return gulp.src('src/*.js')
    .pipe(concat('yt-tooltip.js'))
    .pipe(gulp.dest('dist/'));
});

var TASKS = [
  'connect', 
  'watch',
  'dev:scripts',
  'dev:sass',
  'css'
];

gulp.task('default', TASKS);

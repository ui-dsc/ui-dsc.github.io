'use strict'

const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');

const ROOT = 'dist/';
const paths = {
  html: 'src/*.html',
  css: 'src/css/**/*.css',
  js: 'src/js/**/*.js',
  sw: 'src/service-worker.js',
  images: 'src/images/**',
  vendor: 'src/js/vendors/*.js',
  manifest: 'src/manifest.json'
};

function browserSyncTask(done) {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 8080
  });
  done();
}

function clean() {
  return del([".dist/"]);
}

function images() {
  return gulp
    .src(paths.images)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
          ]
        })
      ])
    )
    .pipe(gulp.dest(ROOT + 'images'));
};

function css() {
  return gulp
    .src(paths.css)
    .pipe(sourcemaps.init())
    .pipe(cleanCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(ROOT + 'css'))
    .pipe(browserSync.stream());
};

function js() {
  return gulp
    .src(paths.js, {ignore: [paths.sw, paths.vendor]})
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(ROOT + 'js'))
    .pipe(browserSync.stream());
};

function manifest() {
  return gulp
    .src(paths.manifest)
    .pipe(gulp.dest(ROOT))
    .pipe(browserSync.stream());
};

function sw() {
  return gulp
    .src(paths.sw)
    .pipe(uglify())
    .pipe(gulp.dest(ROOT))
    .pipe(browserSync.stream());
};

function vendor() {
  return gulp
    .src(paths.vendor)
    .pipe(uglify())
    .pipe(gulp.dest(ROOT + '/js/vendors'))
    .pipe(browserSync.stream());
};

function html() {
  return gulp.src(paths.html)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(ROOT))
    .pipe(browserSync.stream());
};

function watchFiles() {
  gulp.watch(paths.js, js);
  gulp.watch(paths.css, css);
  gulp.watch(paths.html, html);
  gulp.watch(paths.images, images);
};

exports.build = gulp.series(
  clean,
  gulp.parallel(js, css, html, images, sw, vendor, manifest)
);

exports.watch = gulp.parallel(watchFiles, browserSyncTask);

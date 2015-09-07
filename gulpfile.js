/* globals require */

(function() {
  'use strict';

  var gulp        = require('gulp'),
      browserSync = require('browser-sync').create();

  gulp.task('default', function() {
    browserSync.init({
      open: false,
      port: 9001,
      server: {
        baseDir: './'
      }
    });

    gulp.watch('./js/**/*.js').on('change', browserSync.reload);
  });
})();

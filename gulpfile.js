const gulp = require('gulp')
const watch = require('gulp-watch')
const run = require('gulp-run')
const nodemon = require('gulp-nodemon')

gulp.task('watch', ['js', 'css'], function () {
  watch('./src/**/*.scss', function () {
    gulp.start('build')
  })

  watch('./src/**/*.js', function () {
    gulp.start('js')
  })

  nodemon({
    script: 'index.js',
    ignore: ['src/**/*', 'public/**/*', 'build/**/*']
  })
})

gulp.task('build', ['js', 'css'])

gulp.task('js', function () {
  return run('npm run build:app').exec()
})

gulp.task('css', function () {
  return run('npm run build:css').exec()
})

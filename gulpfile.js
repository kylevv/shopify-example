const gulp = require('gulp')
const watch = require('gulp-watch')
const run = require('gulp-run')
const nodemon = require('gulp-nodemon')

gulp.task('watch', ['js', 'css', 'copy'], function () {
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

gulp.task('build', ['js', 'css', 'copy'])

gulp.task('js', function () {
  return run('npm run build:app').exec()
})

gulp.task('css', function () {
  return run('npm run build:css').exec()
})

gulp.task('copy', function () {
  return gulp.src([
    'semantic/dist/semantic.min.css',
    'semantic/dist/semantic.min.js',
    'node_modules/jquery/dist/jquery.min.js'
  ]).pipe(gulp.dest('./auth/'))
})

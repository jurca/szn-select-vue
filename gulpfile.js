'use strict' // eslint-disable-line strict

const del = require('del')
const gulp = require('gulp')
const babel = require('gulp-babel')
const replace = require('gulp-replace')
const packageInfo = require('./package.json')

const compatibleVersionRange = `${packageInfo.version.split('.').shift()}.x`

function clean() {
  return del('./dist')
}

function copyMetaFiles() {
  return gulp.src(['./package.json', './README.md', './LICENSE'])
    .pipe(gulp.dest('./dist'))
}

function compileJs() {
  return gulp.src('./index.js')
    .pipe(babel({
      presets: [['env', {
        targets: {
          node: '8', // current LTS
        },
      }]],
    }))
    .pipe(replace('<VERSION>', compatibleVersionRange))
    .pipe(gulp.dest('./dist'))
}

exports.default = gulp.series(
  clean,
  gulp.parallel(
    copyMetaFiles,
    compileJs,
  ),
)

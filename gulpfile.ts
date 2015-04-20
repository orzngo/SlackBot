/// <reference path="./typings/gulp/gulp.d.ts"/>
/// <reference path="./typings/gulp-typescript/gulp-typescript.d.ts"/>

import gulp = require("gulp");
import ts = require("gulp-typescript");

var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var util = require("gulp-util");
var jasmine = require("gulp-jasmine");
var tslint = require("gulp-tslint");

var tsProject: ts.Params = ts.createProject({
  target: "ES5",
  module: "commonjs",
  sortOutput: true,
  noImplicitAny: true
});

var tsServerSrc: Array<string> = ["./src/**/*.ts"];

function buildErrorMessage(error: any) {
  // gulp-typescript の生成するエラーメッセージがターミナルカラーの制御文字含むので取り除く
  return util.colors.stripColor(error.message);
}

gulp.task("tsc:server", () => {
  gulp.src(tsServerSrc)
    .pipe(plumber({errorHandler: notify.onError(buildErrorMessage)}))
    .pipe(ts(tsProject))
    .pipe(gulp.dest("./release"));
});


gulp.task("jasmine", () => {
  gulp.src("./spec/**/*.ts")
    .pipe(plumber({errorHandler: notify.onError(buildErrorMessage)}))
    .pipe(ts(tsProject))
    .pipe(jasmine());

});


gulp.task("tsc", ["tsc:server"], () => {
});

gulp.task("watch", ["tsc"], () => {
  gulp.watch(tsServerSrc, ["tsc:server"]);
});

gulp.task("tslint", function() {
  gulp.src(["./src/**/*.ts", "./gulpfile.ts"])
    .pipe(plumber())
    .pipe(tslint())
    .pipe(tslint.report("verbose"));
});

gulp.task("default", ["tsc"], () => {});
gulp.task("lint", ["tslint"], () => {});

const gulp = require("gulp");
const del = require("del");
const tap = require("gulp-tap");
const pp = require('preprocess');
const path = require('path');

const srcPath = "./src/**";
const distPath = "./dist/";

const htmlFiles = [`${srcPath}/*.html`];
const cssFiles = [`${srcPath}/*.css`];
const jsFiles = [`${srcPath}/*.js`];

const env = process.env.NODE_ENV

/* 清除dist目录 */
gulp.task("clean", done => {
	del.sync(["dist/**"]);
	done();
});

const html = () => {
	return gulp
		.src(htmlFiles, { since: gulp.lastRun(html) })
		.pipe(
			tap(file => {
				let contents = file.contents.toString("utf8")
				contents = pp.preprocess(contents, {NODE_ENV: env}, {type: 'html'})
				file.contents = Buffer.from(contents)
			})
		)
		.pipe(gulp.dest(distPath));
};
gulp.task(html);

const js = () => {
	return gulp
		.src(jsFiles, { since: gulp.lastRun(js) })
		.pipe(
			tap(file => {
				let contents = file.contents.toString("utf8")
				contents = pp.preprocess(contents, {NODE_ENV: env}, {type: 'js'})
				file.contents = Buffer.from(contents)
			})
		)
		.pipe(gulp.dest(distPath));
};
gulp.task(js);

const css = () => {
	return gulp
		.src(cssFiles, { since: gulp.lastRun(js) })
		.pipe(
			tap(file => {
				let contents = file.contents.toString("utf8")
				contents = pp.preprocess(file.contents, {NODE_ENV: env}, {type: 'css'})
				file.contents = Buffer.from(contents)
			})
		)
		.pipe(gulp.dest(distPath));
};
gulp.task(css);

gulp.task("watch", () => {
  gulp.watch(cssFiles, css);
  gulp.watch(jsFiles, js);
  gulp.watch(htmlFiles, html);
});
// parallel 相当于promise.all
gulp.task(
  "dev",
  gulp.series(
    "clean",
    gulp.parallel("html", "js", "css"),
    "watch"
  )
);

gulp.task(
  "pro",
  gulp.series(
    "clean",
    gulp.parallel("html", "js", "css")
  )
);
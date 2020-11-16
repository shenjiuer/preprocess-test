const gulp = require("gulp");
const del = require("del");
const tap = require("gulp-tap");
const pp = require('preprocess');
const gulpCopy = require("gulp-copy");
const babel = require("gulp-babel");
const rename = require('gulp-rename');
const less = require("gulp-less");

const srcPath = "./src/**";
const distPath = "./dist/";

const htmlFiles = [`${srcPath}/*.wxml`];
const cssFiles = [`${srcPath}/*.{wxss,less}`];
const jsFiles = [`${srcPath}/*.{js,wxs}`];
const imageFiles = [`${srcPath}/*.{png,jpg,gif,ico}`];
const jsonFiles = [`${srcPath}/*.json`];
const rewriteSrcPath = {
  'pro': `./pro_src/**`
}

const babelCfg = {
  plugins: [[
    require.resolve('babel-plugin-module-resolver'),
    {
      "root": ["./src"],
      "alias": {
        "@root": "./src/"
      }
    }
  ]]
};

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
        contents = pp.preprocess(contents, { NODE_ENV: env }, { type: 'html' })
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
        contents = pp.preprocess(contents, { NODE_ENV: env }, { type: 'js' })
        file.contents = Buffer.from(contents)
      })
    )
    .pipe(babel(babelCfg))
    .pipe(gulp.dest(distPath));
};
gulp.task(js);

const css = () => {
  return gulp
    .src(cssFiles, { since: gulp.lastRun(js) })
    .pipe(
      tap(file => {
        let contents = file.contents.toString("utf8")
        contents = pp.preprocess(contents, { NODE_ENV: env }, { type: 'css' })
        file.contents = Buffer.from(contents)
      })
    )
    .pipe(less())
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest(distPath));
};
gulp.task(css);

const img = () => {
  return gulp
    .src(imageFiles, { since: gulp.lastRun(img) })
    .pipe(gulp.dest(distPath));
};
gulp.task(img);

const json = () => {
  return gulp
    .src(jsonFiles, { since: gulp.lastRun(json) })
    .pipe(
      tap(file => {
        let contents = file.contents.toString("utf8")
        contents = pp.preprocess(contents, { NODE_ENV: env }, { type: 'json' })
        file.contents = Buffer.from(contents)
      })
    )
    .pipe(gulp.dest(distPath));
};
gulp.task(json);

const copy = () => {
  return gulp
    .src(`${rewriteSrcPath[env]}/**`)
    .pipe(gulpCopy(distPath, { prefix: 1 }))
}
gulp.task(copy);

gulp.task("watch", () => {
  gulp.watch(cssFiles, css);
  gulp.watch(jsFiles, js);
  gulp.watch(htmlFiles, html);
  gulp.watch(imageFiles, img);
  gulp.watch(jsonFiles, json);
});
gulp.task(
  "dev",
  gulp.series(
    "clean",
    gulp.parallel("html", "js", "css", "img", "json"),
    "watch"
  )
);

gulp.task(
  "pro",
  gulp.series(
    "clean",
    gulp.parallel("html", "js", "css", "img", "json"),
    "copy"
  )
);
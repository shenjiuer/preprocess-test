## 使用gulp构建微信小程序

> 本文提出了应对不同商家共用一套小程序模板的解决方案。

[项目地址](https://github.com/shenjiuer/preprocess-test)

#### 前言

多个不同的商家小程序可能对于页面的内容、要求不尽相同，但是大部分页面功能（比如商城功能）又都是一样的，如果直接针对不同商家定制化开发的话，不利于后期通用业务迭代优化。因此制定了这么一套根据不同环境变量来编译不同的商家小程序代码，下面用`dev` 和`pro` 这两个环境变量来代表两个不同的商家。

#### 使用

````
npm run dev
npm run build
````

#### 项目目录

```
preprocess-test
├── dist         // 编译后目录
├── node_modules // 项目依赖
├── pro_src      // 放置不同行业页面差异较大的部分，以做文件覆盖
├── src 
│    ├── pages      // 小程序page文件
│    ├── wxs        // wxs 模块
│    ├── utils      // 公共js文件
│    ├── app.js
│    ├── app.json
│    ├── app.wxss
├── .gitignore
├── .gulpfile.js
├── project.config.json // 项目配置文件
├── package-lock.json
├── package.json
└── README.md
```

##### 条件编译

这里主要用到了[preprocess](https://github.com/jsoverson/preprocess)处理条件编译

```js
const gulp = require("gulp");
const tap = require("gulp-tap");
const pp = require('preprocess');

const srcPath = "./src/**";
const distPath = "./dist/";
const env = process.env.NODE_ENV // 环境变量

const htmlFiles = [`${srcPath}/*.wxml`];

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
```

这样处理之后就可以在`wxml` 中针对环境变量`NODE_ENV` 编译不同条件下的小程序代码了，这种条件编译适用于不同商家页面差异较小的部分。

```html
<!-- @if NODE_ENV=='dev' -->
<view>这里是dev环境</view>
<!-- @endif -->
<!-- @if NODE_ENV=='pro' -->
<view>这里是pro环境</view>
<!-- @endif -->
```

如果是页面改动较大，那么用条件编译的方式会造成大量不同商家的代码混淆在一起，不易后期维护，这里利用`gulp-copy` 做文件覆盖。

```js
const gulp = require("gulp");
const gulpCopy = require("gulp-copy");
const distPath = "./dist/";

const rewriteSrcPath = {
  'pro': `./pro_src/**`
}
const env = process.env.NODE_ENV // 环境变量

const copy = () => {
  return gulp
    .src(`${rewriteSrcPath[env]}/**`)
    .pipe(gulpCopy(distPath, { prefix: 1 }))
}
gulp.task(copy);
```

如果需要在`pro` 环境重写首页，就需要在根目录下新建`pro_src/pages/index`，编写该环境下的首页内容，用来覆盖`src/pages/index` 页面中的内容。

##### alias

这里用到了[gulp-babel](https://github.com/babel/gulp-babel) 处理小程序引用路径问题。

```js
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

const js = () => {
  return gulp
    .src(jsFiles, { since: gulp.lastRun(js) })
    .pipe(babel(babelCfg))
    .pipe(gulp.dest(distPath));
};
gulp.task(js);
```

这样引用公共函数的时候就可以直接写`const date = require('@root/utils/common/date')`，编译完输出`const date = require('../../utils/common/date')`。

### 参考

+ [基于Gulp构建的微信小程序开发工作流](https://juejin.cn/post/6844903635768311815)
+ [使用gulp构建微信小程序开发工作流](https://juejin.cn/post/6844904100849680398)
+ [配置别名](https://stackoverflow.com/questions/61431981/gulp-require-alias)

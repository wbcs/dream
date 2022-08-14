# 目的

自己搭建一款 react 脚手架，仅仅实现功能，优化什么的谈不上。以后有能力了再说。

# 准备工作

先新建一个目录：

```shell
  mkdir react-webpack
  cd react-webpack
  npm init -y
  mkdir src
  touch index.js
```

下载一些必要工具：

```shell
  npm install -D webpack
  npm install -D webpack-cli
  npm install -D webpack-dev-server
```

# 开始搭建

## 安装 react 生态工具

我们搭建的 react 的脚手架，自然要 react 的一些依赖了。

```shell
  npm install --save react
  npm install --save react-dom
  npm install -D prop-types
```

## 安装 babel

需要能够识别并运行 react，需要 babel 将 jsx 转换为 js 语句。所以接下来必不可少的就是 babel 了。

```shell
  npm install --save @babel/core
  npm install -D babel-loader
  npm install -D @babel/preset-react
  npm install -D @babel/preset-env
```

在根下创建文件`.babelrc`:

```shell
  touch .babelrc
```

我们先将 jsx 转换为 js 代码，我们的 react 基本都是用 es2015+来写的，所以还得将其转换为 es5 代码。所以`.babelrc`内容：

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

> 多说一句，babel 中的 preset 的执行顺序是数组的逆序。

## 写一下 webpack

ok，对应的 loader 都安装 ok，接下来要让它工作就得 webpack 上场了。

一开始我们就下载了 webpack，所以这里直接写。

建立`webpack.config.js`:

```js
const path = require('path');

const config = {
  entry: './src/index.js', // 不写默认也是它
  output: {
    path: path.resolve('dist'),
    filename: 'js/[name].[hash].js',
  },
  module: {
    rules: [{ test: /\.(js|jsx)$/, use: ['babel-loader'] }],
  },
};

module.exports = config;
```

ok,现在 js 应该可以被打包，然后打开运行了。不过这样很麻烦，直接热加载更爽。所以接下来配置开发 server：

先在`package.json`中的 scripts 中添加：

```json
{
  "scripts": {
    "start": "webpack-dev-server --open --mode development",
    "build": "webpack --mode production"
  }
}
```

ok!现在`npm start`, 哦等等，没 html 文件你运行你 🐴 呢。还得搞个 html 模板文件，我这里在根目录下弄：

```shell
  touch index.html
```

index.html:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>React-Webpack</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

这样肯定还不行。还需要一个 webpack 插件： `html-webpack-plugin`

```shell
  npm install -D html-webpack-plugin
```

webpack.config.js:

```js
const path = require('path');
const HtmlWebapckPlugin = require('html-webpack-plugin');

const config = {
  entry: './src/index.js', // 不写默认也是它
  output: {
    path: 'dist',
    filename: '/js/[name].[hash].js',
  },
  module: {
    rules: [{ test: /\.(js|jsx)$/, use: ['babel-loader'] }],
  },
  plugins: [
    new HtmlWebapckPlugin({
      template: './index.html',
      title: 'hehe ~~~',
    }),
  ],
};

module.exports = config;
```

ok👌，大功告成，可以写 react 了。

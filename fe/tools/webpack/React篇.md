# 目的
自己搭建一款react脚手架，仅仅实现功能，优化什么的谈不上。以后有能力了再说。

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
## 安装react生态工具
我们搭建的react的脚手架，自然要react的一些依赖了。
```shell
  npm install --save react
  npm install --save react-dom
  npm install -D prop-types
```

## 安装babel
需要能够识别并运行react，需要babel将jsx转换为js语句。所以接下来必不可少的就是babel了。
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

我们先将jsx转换为js代码，我们的react基本都是用es2015+来写的，所以还得将其转换为es5代码。所以`.babelrc`内容：
```json
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react",
  ]
}
```
> 多说一句，babel中的preset的执行顺序是数组的逆序。

## 写一下webpack
ok，对应的loader都安装ok，接下来要让它工作就得webpack上场了。

一开始我们就下载了webpack，所以这里直接写。

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
    rules: [
      { test: /\.(js|jsx)$/, use: ['babel-loader'] },
    ],
  },
};

module.exports = config;
```

ok,现在js应该可以被打包，然后打开运行了。不过这样很麻烦，直接热加载更爽。所以接下来配置开发server：

先在`package.json`中的scripts中添加：
```json
{
  "scripts": {
    "start": "webpack-dev-server --open --mode development",
    "build": "webpack --mode production"
  }
}
```

ok!现在`npm start`, 哦等等，没html文件你运行你🐴呢。还得搞个html模板文件，我这里在根目录下弄：
```shell
  touch index.html
```
index.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>React-Webpack</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

这样肯定还不行。还需要一个webpack插件： `html-webpack-plugin`
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
    rules: [
      { test: /\.(js|jsx)$/, use: ['babel-loader'] },
    ],
  },
  plugins: [
    new HtmlWebapckPlugin({
      template: './index.html',
      title: 'hehe ~~~',
    }),
  ]
};

module.exports = config;
```

ok👌，大功告成，可以写react了。
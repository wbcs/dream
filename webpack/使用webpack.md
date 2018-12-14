
# 自己弄一个用webpack搭一个模块开发
## CSS与Stylus
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js/',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }, // 实际调用是从后往前调用loader
      { test: /\.styl$/, use: ['style-loader', 'css-loader', 'stylus-loader'] }, // 这个不仅仅要下载对应的loader，还要下载stylus本身，
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
          'file-loader', // 可以接受并加载任何类型的文件，并且输出到构建目录（只能生成url，给引进来）
        ]
      }
    ]
  }
}
```

## Html-webpack-plugin
目前了解的功能就是每次都会生成新的`index.html`文件，其中的依赖自动引入（根据filename）
```javascript
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: 'byte dance!'
    }),
    new CleanWebpackPlugin(['dist']), // 一个每次都会清除dist目录的插件
  ]
}
```
## webpack-dev-server
```javascript
// package.json
{
  "scripts": {
    "start": "webpack-dev-server --open" //热更新
  }
}
// webpack.config.js
module.exports = {
  devServer: {
    contentBase: './dist'   // 默认localhost:8080读取的文件目录
  }
}
```
## webpack-dev-middleware
等于是自己用`express`和`weboack-dev-middleware`中间件自己搭了一个后台,用的不多，就不说了,直接看代码吧。
```javascript
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const config = require('./webpack.config.js');
const compiler = webpack(config);
const app = express();

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.listen(3000, () => console.log('over'));

```

## HMR(Hot Module Replacement)
`webpack`自带的也有热更新，不过每次修改文件的时候页面会完全刷新，而HMR可以做到部分更新。
```javascript
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { 
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      }
    ]
  }
  plugins: [
    new HtmlWebpackPlugin({
      title: 'HMR',
    }),
    new CleanWebpaclPlugin(['dist']),
    new webpack.HotModuleReplacementPlugin(), // webpack内置插件
  ],
  devServer: {
    contentBase: './dist',
    hot: true,   //  表示开启HMR
  }
};

```

## 压缩输出
webpack4开始，只需要讲mode设置为priduction即可。

## tree shaking(摇晃树)
意思就是把整个项目看作树一棵树，把有用的部分看作树的绿叶，无用的看作枯叶，摇晃树讲枯叶干掉，就减少了无用的部分。

在package.json中增加sideEffects字段，将有可能会影响到全局的文件/模块的路径添加到这个数组中，防止被干掉，其余不会影响到全局的文件，webpack对应的插件就会将无用的部分干掉。
```javascript
{
  "sideEffects": [
    "*.css", //一般css文件都需要添加到sideEffects中
  ]
}
```
仅仅这样还不能删除掉无用的代码，还需一个插件：
```javascript
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  plugins: [
    new UglifyJSPlugin(),
  ]
};
```
再加上它就ok了。

# 自己弄一个用webpack搭一个模块开发
## CSS与Stylus
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js/,
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
目前了解的功能就是每次都会生成新的index.html文件，其中的依赖自动引入（根据filename）
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
等于是自己用express用weboack-dev-middleware中间件自己搭了一个后台

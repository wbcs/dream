# 前言
平时在进行`vue`的开发时，都是使用别人搭建好的脚手架。自从开始学习`webpack`和`babel`，我就萌生了自己搭建一套脚手架的想法，所以跟着教程自己来一边。顺便记录下适合自己复习的点点滴滴。

# 准备工作
准备工作都是新建项目目录，一些必要的依赖等等。就不多说了，直接看`shell`：
```shell
  mkdir vue-demo
  cd vue-demo
  npm init -y
  mkdir src public
  touch src/index.js src/App.vue public/index.html
  touch webpack.config.js .babelrc
  npm install webpack webpack-dev-server webpack-cli -D
  npm babel-loader vue-loader -D
  npm install @babel/core -S
  npm install @babel/preset-env -D
  npm install vue -S
  npm install vue-template-compiler -D
  npm install html-webpack-plugin -D
```

index.html：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

index.js
```js
import Vue from 'vue';
import App from '/App.vue';

new Vue({
  el: '#app',
  render: h => h(App),
});
```

App.vue
```js
<template>
  <div>{{msg}}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Hello Vue',
    };
  },
}
</script>
```

ok, 然后配置`webpack.config.js`文件：
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      title: 'Hello webpack vue',
    }),
    new VueLoaderPlugin(),
  ],
};
```

最后一步，转译ES6,.babelrc:
```json
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

好了👌
> 关于其他css 引入文件等这里就不赘述了，我其他文章都写过。

# 总结
感觉 `vue` 的配法跟 `webpack` 还是不太一样的， `vue` 更简单。
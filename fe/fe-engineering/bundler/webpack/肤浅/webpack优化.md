# 压缩优化

- `mode:production`开启代码压缩，减小 `bundle`体积。
- 使用`UglifyJSPlugin`压缩代码体积。

# 生产环境优化 

- 避免使用`inline-*`、`eval-*`，因为他们  会增加`bundle`大小，降低整体性能。

##  抽离公共代码

```javascript
optimization: {
  splitChunks: {
    cacheGroups: {
      vendor: {   // 抽离第三方插件
        test: /node_modules/,   // 指定是node_modules下的第三方包
        chunks: 'initial',
        name: 'vendor',  // 打包后的文件名，任意命名
        // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
        priority: 10
      },
      utils: { // 抽离自己写的公共代码，utils这个名字可以随意起
        chunks: 'initial',
        name: 'utils',  // 任意命名
        minSize: 0    // 只要超出0字节就生成一个新包
      }
    }
  }
},
```

# 懒加载

因为有时候只有完成某些操作之后才需要用到某个模块，这就意味着  某些模块可能永远也不会被加载。这个时候可以使用`import();`

```javascript
element.on('type', () => {
  import('...')
    .then((module) => {
      // some actions;
    })
    .catch((error) => {
      // ...
    });
});
```

> 这样某些需要按需引入的模块就不必每次都被请求了，可以减少 main bundle 的体积，提高初次加载速度。

# 配置优化 

可以将原先的`webpack.config.js`，分割为以下形式：

- `webpack.prod.js`
- `webpack.dev.js`
- `webpack.common.js`

将公共配置抽离到`webpack.common.js`中，然后在其他两个文件中分别引入此公共配置，`module.exports = merge(common, newConfig);`并在`package.json`中的`scripts`里对生产环节和开发环境做不同的处理：

```javascript
{
  "scripts": {
    "start": "webpack --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
  }
}
```

# 打包速度优化

使用

```javascript
new UglifyWebpackPlugin({
  cache: true, // 启用缓存，如果文件内容没有变的话，直接使用缓存，就不重复压缩、打包，进而提升速度
  parallel: true, // 启用多进程，提升打包速度
});
```

还可将文件压缩等操作，只在生产环境下使用对应的插件，而在开发环境下不压缩，也可以提高开发时的打包速度。

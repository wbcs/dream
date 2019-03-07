# 前言💡
`webpack4`，在`mode: production`下，可以自动实现对打包出来的js文件进行压缩，而且webpack自身也只能理解JavaScript。

那对CSS文件该如何处理呢？

# 关于对CSS文件的配置
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
```
> 其中，`use`中`loader`的执行顺序是从后向前的，也就是说`webpack`会先对`import`进来的`css`使用`css-loader`进行解析，然后使用`style-loader`将这些`css`添加到<`style>`中。这样就实现了`webpack`解析`css`的功能。

# 将style中的css分离为单独的css文件
按照之前的做法，我们写的`css`都会被弄到`style`标签中，如果需要把它们提取到一个单独的文件中，又该怎么做呢？

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb3605ea459a6?w=606&h=562&f=png&s=104408)
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const module = {
  rules: [
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    }
  ]
};

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'path/[name].[hash].css', // path是相对于dist之下而言的
  })
];
```
> 答案就是使用`MiniCssExtractPlugin.loader`代替`style-loader`，然后在`plugins`中`new`一个`MiniCssExtractPlugin`的实例，传递对应的参数即可。

不过这样还有一个问题，就是分离出来的css文件并没有被压缩，依然保留之前的缩进、注释等等。

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb34e2cee36aa?w=580&h=325&f=png&s=42151)

# 压缩分离出来的css文件
这个操作比较简单，只需要一个插件。
```javascript
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = {
  ...,
  plugins: [
    ...,
    new OptimizeCssAssetsPlugin(),
  ]
};
```
可以看到压缩以后的效果：

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb34300da5378?w=1119&h=89&f=png&s=35165)

# 使用css预编译
## stylus
先拿stylus举个例子，其他的一毛一样。
```javascript
const config = {
  module: {
    rules：[
      {
        test: /\.styl/,
        use: [
          MiniCssExtractPlugin.loader,  // 单独分离，如果不需要，可以使用style-loader
          'css-loader',
          'stylus-loader',
        ]
      }
    ]
  },
  plugins: [
    new OptimizeCssAssetsPlugin(),
  ]
};
```
> 和`css`不一样的是，需要在`css-loader`之前使用`stylus-loader`进行解析，然后跟`css`一样。需要注意的是，别忘了下载`stylus`。

## less、sass
只用把`stylus-loader`换成`less-loader`、`sass-loader`即可。

# 添加CSS3前缀
需要下载两个东东：
+ postcss-loader
+ autoprefixer

然后需要在根目录下创建一个`postcss.config.js`文件，内容如下：
```javascript
module.exports = {
  plugins: [require('autoprefixer')]
};
```
最后一步，在`webpack.config.js`在`use`使用到的`loader`中，在`css-loader`之前(直接前驱，注意这里是数组之后，因为`loader`的执行顺序是从后向前，我这里的说的之前指的是执行顺序的顺序).
```javascript
{
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'stylus-loader']
}
```

# 结语
实现相同功能的`plugin`不止这一个，但是现在就知道这个，如果以后发现更好的，会即使更新。
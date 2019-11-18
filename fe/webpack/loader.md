# loader的几个特点
+ `loader`和`plugin`的区别：`loader`的职责更加单一。因为`webpack`只能读懂`js`文件，`loader`的职责就是把其他类型的文件转换为`webpack`所能处理的形式。
+ `loader`的处理顺序：如果`use/loader`是一个数组，那`webpack`调用`loader`的顺序将会是倒叙


# 写一个loader
首先明白一点，一个`loader`就是一个`node`模块。而对于要发布到`npm`的`loader`，`package.json`中需要添加一个字段，这个字段的`key`就是`loader`，值为`loader`的名字：
```json
{
  "loader": "wb-loader",
}
```
> 一般`loader`的命名为 `xxx-loader`

然后谈谈`loader`的执行，除了上面提到的倒叙执行以外，`loader`的执行有可能是同步，也可能是异步的。

另外，`loader`是由`webpack`调用的，对`loader`输入的是对应文件的字符串（也可以是`buffer`），输出自然是最终结果呐。
```js
// my-fucking-loader.js
module.exports = function(source) {
  return `
    export default {
      name: 'wbingcs'
    }
  `
}
```
这就是最简单的一个`loader`了。在说更多高级功能之前先来看看怎么用我们自己写的`loader`。

# 引用我自己的loader
```js
const config = {
  module: {
    rules: [
      { test: /\.wb$/, use: path.resolve(__dirname, 'your-fucking-loader-filepath') }
    ]
  }
}
// 除了暴力用path直接致命loader的位置，还可以这么写：
const config {
  module: {
    rules: [
      { test: /\.wb$/, use: 'your-fucking-loader-filename' }
    ]
  },
  resolveLoader: {
    modules: [
      'node_modules', // 先去node_modules查找
      'your-fucking-loader-path'  // 然后去这个路径查找
    ]
  }
}
```
这两种都能用，但是要做到和直接引用从`npm`下载下来的`loader`一样，还不行。具体的做法是：
1.  建立好你的`loader`项目（package.json的`loader`属性写好`loader`的名字）
2.  在`loader`项目的根路径下运行`npm link`,意思就是把当前`loader`注册到本机全局
3.  回到要引用的地方，在这个项目的根下运行`npm link your-loader`，意思就是把全局的东东引到`node_modules`下

ok，这样就有直接使用`npm`上的`loader`一样的体验呐。

# 进阶
刚刚的代码
```js
module.exports = function(source) {
  return `
    export default {
      name: 'wbingcs'
    }
  `
}
```
## 取到options
loader在使用的时候是可以传递参数的：
```js
{
  "test": /\.wb$/,
  use: {
    loader: 'wb-loader',
    options: {
      blah: 'blahblahblah...'
    }
  }
}
```
要取到这个options：
```js
const loaderUtils = require('loader-utils')
module.exports = function(source) {
  const options = loaderUtils.getOptions(this)
  return `
    export default {
      name: 'wbingcs'
    }
  `
}
```

## callback
除了上面直接return结果，`loader`中还能够使用`callback`来告诉`webpack`：
```js
module.exports = function(source) {
  this.callback(error, res, sourceMap, AST)
}
```
`callback`的参数从字面意思就能读出来了，分别是错误、结果、sourceMap、AST。因为得到`sourceMap`很耗费时间，而且只在dev环境中会用到，所以呢可以用`this.sourceMap`来判断是否需要用到`sourceMap`。

除了这个`this.callback`，还有一个`callback`。之前我们说过，`loader`的执行可能是同步也可能是异步，上面的例子都是同步。接下来看看异步怎么处理：
```js
module.exports = function(source) {
  const callback = this.async()
  someAsyncAction()
    .then(res => {
      callback(error, res, sourceMap, AST)
    })
}
```

## 二进制数据
上面的例子中，`source`都是`UTF-8`的`string`。但是有的时候我们需要以二进制来处理文件。这个时候可以用这个属性来告诉`webpack`是否向我输入二进制:
```js
module.exports.raw = true
```
这样`source`就是对应的buffer啦

## loader的缓存
因为转换操作需要耗费大量的时间，所以`webpack`会缓存`loader`的结果，如果说被处理的文件、依赖的文件没有发生变化，会直接使用之前的结果，是不会重新去调用`loader`的。如果需要告诉`webpack`我的`loader`你不能缓存的话，可以这样：
```js
module.exports = function(source) {
  this.cacheable = false
}
```

# 总结
有了这些API，再写转换规则就很easy了。
`webpack`这玩意在fe还是蛮重要的，还是得学。绕不过去的

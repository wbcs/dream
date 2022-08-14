# 单入口

```js
const config = {
  entry: '',
};
// 等价
const config = {
  entry: {
    main: '',
  },
};
```

entry 还能是一个数组：

```js
const config = {
  entry: ['filepath0', 'filepath1'],
};
```

这样的意思是有多个主入口，数组的每个元素都是入口，而且最后由两个入口以及其对应的依赖会打包到同一个`bundle`中。

如果数组的意思还不理解，看一下这个就懂了：

```js
const config = {
  entry: {
    main: 'some/path/main/entry.js',
    vendor: ['react', 'react-dom'],
  },
};
```

一般`entry`设置数组的应用在这种情形比较多，也就是 main 主要为业务逻辑代码，而`vendor`是其依赖的第三方代码。这样`webpack`在打包的时候会把`react`、`react-dom`单独打到一个`bundle`中，业务代码到另一个`bundle`中。

> 说白了就是把数组里的文件全部打到一个`bundle`中。

当然，上面的写法`main`和`vendor`中相同的依赖会分别打到其对应的`bundle`中，导致代码重复，这个问题可以通过`splitChunks`解决。

```js
const webpack = require('webpack')
const config {
  entry: {
    main: 'some/path/main/entry.js',
    vendor: ['react', 'react-dom]',
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
```

> 做过实验，两个完全相同的文件都引用 path，大小为 19k，使用 splitChunks 之后大小为 6k，path 被弄到单独的 vendor。

# 多入口/多页

```js
const config = {
  entry: {
    main: '',
    bundle0: '',
    bundle1: '',
    ...,
    bundlen: '',
  }
}
```

各个`bundle`相互独立。会有多个`bundle`产生。现在大部分应用都是由`js`来创建`DOM`，所以切换页面的时候 html 模板的内容其实是很少的，大头是`js`文件，这个时候我们就可以把不同页面之间，相同的依赖分离出来。方便浏览器缓存，提升效率。

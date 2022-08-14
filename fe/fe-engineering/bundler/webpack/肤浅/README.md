# 概念

`webpack`是一个现代`JavaScript`应用程序的**静态模块打包器**(`module bundler`)。

`webpack`会递归地构建一个*依赖关系图*，其中包含应用程序所需的所有模块，然后将这些模块打包成一个(或多个)`bundle`。

## 四个核心概念

- 入口(entry)
- 输出(output)
- loader
- 插件(plugins)

# entry

`entry point`只是`webpack`应该使用哪个模块来作为构建依赖关系图的开始，进入`entry point`后，`webpack`会找出有哪些模块和库是被这个`entry point`所依赖的。

每个依赖都会被处理，最后输出到`bundles`中。

以下是一个 entry 配置的简单例子：

`webpack.config.js`

```JavaScript
module.exports = {
  entry: './path/file.js'
};
```

## 语法

`entry: string|Array<string>`

### 一、单个入口

`webpack.config.js`

```javascript
const config = {
  entry: './path/index.js',
};

// 上面的写法是下面的简写
const config = {
  entry: {
    main: './path/index.js',
  },
};
```

> 如果`entry`是一个数组，会创建多个主入口，如果需要多个依赖文件一起注入，将它们的依赖导图导向一个`chunk`时，传入数组的方式就很有用。

### 二、对象语法

`entry:{ [entryChunkName: string]: string|Array<string> }`

`webpack.config.js`

```javascript
const config = {
  entry: {
    app: './src/app.js',
    vendors: './src/vendors.js',
  },
};
```

对象语法是 定义入口最可扩展的方式，可以重用、与其他配置组合使用。将关注点从环境、构建目标、运行时中分离，然后使用专门的工具(比如`webpack-merge`)将它们合并。这种设置还可以使用`CommonsChunkPlugin`从`App`的`bundle`中提取`vendors`引用到`vendor bundle`中，并把引用部分替换为`__webpack_requre__()`调用。

> 简单理解就是把用到`vendor`的地方提取成一个函数，到时候调用就行了。

> 个人的理解就是：没有关系的文件需要打包到一起时，使用数组。当有多个入口文件，每个都需要单独打成一个文件时，使用对象语法。而上面的什么`app、vendors`都是对应的名字，你可以取任意名字。在`output`中可以`[name].js`来给出口文件取名字。而`entry`直接写`string`时，其实是`main:string`,所以最后的名字就是 main.js。

### 具体场景

`webpack.config.js`

```javascript
const config = {
  entry: {
    pageOne: './src/pageOne/index.js',
    pageTwo: './src/pageTwo/index.js',
    pageThree: './src/pageThree/index.js',
  },
};
```

上面会有三个独立的依赖图，并且可以使用`CommonsChunkPlugin`为每个页面分离出共享的`bundle`，可以复用他们之间的大量代码。

# output

`output`告诉`webpack`在哪里输出它所创建的`bundles`，以及如何命名这些文件。默认为`./dist`。

`webpack.config.js`

```javascript
const path = require('path');

module.exports = {
  entry: './path/index.js', // entry point
  output: {
    // 生成(emit)的bundle信息
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack-bundle.js',
    publicPath: '/', // 为所有的公共资源指定一个公共路径，所有的公共资源引用都会在publicPath下去请求
  },
};
```

## 用法

`webpack.config.js`

```javascript
// [name]是对应的entry point的name
// 而[hash]是根据文件内容生成的哈希
output: {
  path: "/home/proj/cdn/assets/[hash]",
  publicPath: "/assets/[hash]/"
}
```

在编译时不知道最终输出文件的 `publicPath` 的情况下，`publicPath` 可以留空，并且在入口起点文件运行时动态设置。如果你在编译时不知道 `publicPath`，你可以先忽略它，并且在入口起点设置 `__webpack_public_path__`。

```javascript
__webpack_public_path__ = myRuntimePublicPath;
// 剩余的应用程序入口
```

## path 和 publicPath 的区别：

- `path`只是指定最终的编译目录而已，必须是绝对路径。
- `publicPath`：所有资源的基础路径，`静态资源最终访问路径 = ouput.publicPath + 资源loader等配置的路径；`可以是相对路径(相对于打包后的 index.html 的)

> path 就是打包后文件所在路径。publicPath 就是打包后，文件对静态资源引用的公共路径。

举个例子：

```js
const config = {
  output: {
    path: '/usr/',
    publicPath: 'http://host/',
  },
};
```

```html
<img src="imgs/app.png" />
```

> img 最终引用的路径为： http://host/imgs/app.png

如果 publicPath 是相对路径，这个路径是相对于打包后的 index.html 的。

# loader

`webpack`自身只理解`JavaScript`，而`loader`则可以让`webpack`去处理那些非`JavaScript`文件。

`loader`可以将所有类型的文件转换为`webpack`能够处理的有效模块，然后就可以利用`webpack`的打包能力去处理。

`webpack loader`将所有类型的文件转换为`APP`的依赖图和最终的`bundle`可以直接引用的模块。

> loader 能够 import 任何类型的模块(.css 等)。

在`webpack`的配置中`loader`有两个目标：

1. `test`: 用于标识出应该被对应的`loader`进行转换的某个文件。
2. `use`: 表示进行转换时应使用哪个`loader`。

`webpack.config.js`

```javascript
const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack-bundle.js',
  },
  module: {
    rules: [{ test: /\.css$/, use: 'css-loader' }],
  },
};
```

> 上面的`test、use`的意思就是，告诉`webpack`：在遇到`require/import`语句中被解析为`.css`的路径时，打包之前先用`css-loader`转换一下。

> 注意：在`webpack`配置中定义`loader`时，要定义在`module.rules`，而不是`rules`中。

# plugins

webpack 插件是一个具有`apply`属性的 JavaScript 对象，apply 会被 webpack compiler 调用，compiler 对象可以在整个编译生命周期访问。

`loader`用于转换某些类型的模块，而插件则可以用于执行范围更广的任务：从打包优化和压缩 到 重新定义环境中的变量。

使用方法：`require`进来后将其添加到`plugins`数组中。多数插件可以通过`options`自定义。也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时可以通过使用`new`来创建它的一个实例。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webapck = require('webpack');

const config = {
  mudule: {
    rules: [{ test: /\.css$/, use: 'css-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};

module.exports = config;
```

## 自己编写一个 demo plugin

```js
const pluginName = 'YourWebpackPlugin';

class YourWebapckPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      // todo...
      console.log('start~~~');
    });
  }
}

module.exports = YourWebpackPlugin;
```

> webpack 的插件比 babel 的简单一点哈。

# 模式

可以使用`deveplopment`或`production`的某一个，来设置 mode 参数。

```javascript
module.exports = {
  mode: 'production',
};
```

或者从 CLI 参数中传递

```cmd
webpack --mode = priduction
```

# 模块

在模块化编程中，开发者将程序分解成`离散功能块(discrete chunks of functionality)`，并称之为**模块**。

## 模块的解析

绝对、相对路径就不说了，看看模块路径：

```js
import 'module';
import 'modules/hehe';
```

在 alias 中指定某个路径为某个别名后，解析器检查路径是否指向一个文件/目录。

如果指向文件：

- 如果有文件扩展名，直接将文件打包；
- 否则使用`resolve.extensions`作为文件扩展名来解析。

如果指向

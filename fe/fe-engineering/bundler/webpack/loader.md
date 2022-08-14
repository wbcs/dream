# loader

## 自己写个 loader

webpack config:

```js
const config = {
  module: {
    rules: [{ test: /\.js$/, use: 'wb-loader', exlucde: /node_modules/ }],
  },
  resolveLoader: {
    alias: {
      'wb-loader': path.resolve(__dirname, './wb-loader'),
    },
  },
};
```

wb-loader.js

```js
// 只是返回code string
function wbLoader(code, sourceMap, meta) {
  return generatorCode(code);
}
// 如果还有生成sourceMap、meta等
function wbLoader(code, sroucemap, meta) {
  this.callback(null, code, sourceMap, meta);
}
// async
function wbLoader(code, srouceMap, meta) {
  const callback = this.async();
  someAsyncAction()
    .then((res) => {
      callback(null, res.code, res.srouceMap, res.meta);
    })
    .catch((err) => callback(err));
}

module.exports = wbLoader;
```

> callback 的第一个参数貌似是 error

## patching loader

`loader` 默认的执行顺序是从后向前执行。但是如果这个 `loader` 有 `pitch` ，那么会执行`loader.pitch()`，然后 `loader()`

```js
{
  use: ['a-loader', 'b-loader', 'c-loader'];
}
```

其实真正的顺序是：

```js
cLoader.patch();
bLoader.patch();
aLoader.patch();

let prevRes = aLoader();
prevRes = bLoader(prevRes);
cLoader(prevRes);
```

只不过大多数 `loader` 没有 `patch` ，或者 `patch` 没有 `return` 一些结果，如果 `b-loader` 返回了些东西：

```js
cLoader.patch();
bLoader.patch();
cLoader();
```

也就是说，一旦某个 `loader.patch` 返回了结果，那会直接执行上一个 `loader()` , 后续的`loader.patch`、`loader` 本身都不再执行！

## raw loader

loader 默认第一个参数都是代码字符串，但是设置 loader 的 raw 为 true， 则第一个参数就会是对应的 buffer， 返回的结果可以是 string/buffer

```js
function wbLoader(buffer) {
  return buffer;
  // or
  return buffer.toString();
}
wbLoader.raw = true;
module.exports = wbLoader;
```

# style-loader

style-loader 就是一个 patching loader。

`style-loader` 其实就是把生成的 `css` 代码放到 `<style>` 标签中，然后 `append` 到 `<head>` 中。

写一个最简单的 style-loader

```js
const loaderUtils = require('loader-utils');

function appendStyle(css) {
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
}
module.exports.patch = function (request) {
  const code = `
    const css = require(${loaderUtils.stringifyRequest(this, '!!' + request)})
    // css modules
    if (css.locals) {
      module.exports = css.locals
    }
    appendStyle(css)
    ${appendStyle.toString()}
  `;
};
```

在文件名前加 `!!` 的意思就是忽略 `当前loader` 配置， 因为 `webpack config` 中配置了在引入 `css` 文件的时候执行对应的 `loader` ，在执行当前 `loader` 的时候又引入了 `css` 会造成无限递归。

这样一个能用的`style-loader`就 ok 了，不过真正的`style-loader`还有一些 `options` ，比如:

- style 标签往哪里插入(insert) 默认 head
- css 的代码往哪个标签里添加(injectType) 默认 styleTag
- 对 HMR 的支持
- 对 options 的检测呀等等

不过核心部分就是我们写的啦~

# css-loader

@TODO

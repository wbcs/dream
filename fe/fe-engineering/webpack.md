## 产物内容

src:

```js
// index.js
import { fuck } from './fuck';
import { shit } from './shit';
console.log(fuck, shit);

// fuck.js
export const fuck = 'fuck';
// shit.js
export const shit = 'shit';
```

build 出来的结果会是一个 IIFE。

各个 module 会以以下方式组织：

```js
// 所有的模块都扔到一个对象里，key是模块的文件路径，value是一个函数
const __webpack_modules__ = {
  // 其他模块类似
  './src/fuck.js': (
    // commonjs 里的 module
    __unused_webpack_module,
    // commonjs 里的 exports
    __webpack_exports__,
    // commonjs 里的 require
    __webpack_require__
  ) => {
    // 包含转译后的模块源代码
    // 模块里的 import、export 都会被转换成 __webpack_require__
    eval(``);
    // eval 里的代码

    // 如果模块是 esm，会做个标记
    __webpack_require__.r(__webpack_exports__);
    // 给 __webpack_exports__ 注入 模块的导出内容
    __webpack_require__.d(__webpack_exports__, {
      fuck: () => 'fuck',
    });
  },
  './src/shit.js': () => {},
  './src/index.js': () => {},
};

const __webpack_cache__ = {};
// webpack 自己实现的一套 require 流程
function __webpack_require__(moduleId) {
  // 简单的cache逻辑，避免module重复执行
  if (typeof __webpack_cache__[moduleId] !== 'undefined') {
    return __webpack_cache__[moduleId].exports;
  }
  // 一个兼容 commonjs 的 module 对象
  const module = { exports: {} };
  __webpack_module_cache__[moduleId] = module;

  // 熟悉的 commonjs require、module、exports 注入
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}
__webpack_require__.d = (exports, definition) => {
  for (const key in definition) {
    // 看这也能猜出来 __webpack_require__.o 是个啥了
    // 就是检测 args0 是不是有 key
    if (
      __webpack_require__.o(definition, key) &&
      !__webpack_require__.o(exports, key)
    ) {
      Object.defineProperty(exports, key, {
        enumerate: true,
        get: definition[key],
      });
    }
  }
};

__webpack_require__.o = (obj, prop) => {
  Object.prototype.hasOwnProperty.call(obj, prop);
};

// define __esModule on exports
__webpack_require__.r = (exports) => {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: 'Module',
    });
  }
  Object.defineProperty(exports, '__esModule', { value: true });
};

// webpack require 入口文件
const __webpack_exports__ = __webpack_require__('./src/index.js');
```

以上就是 build 后的代码组织方式,

## split chunk

配置打包的行为

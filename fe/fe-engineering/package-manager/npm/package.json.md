## type, types, main, module, typesVersions, exports, imports

一个 npm package 被使用的时候会根据其 package.json 中约定好的协议来执行一系列操作：

- type: `'module'` | `'commonjs'`
- main: `commonjs` 模块系统的入口文件
- module: `esm` 模块系统入口文件
- types: `ts` 类型文件

这些字段已经很常见了，但仅仅是这些已经不能很好地满足前端工程的需求了，比如：

- 只是单纯为 `nodejs` 环境打造
- 不同的路径导出不同的、多个、独立的包
- 仅仅导出 `commonjs`
- 仅仅导出 `esm`
- 同时提供 `commonjs` 和 `esm`
- 一个包只是想暴露指定的入口，但不想暴露其他内部方法
- 不想暴露一个公共的方法，但是能够通过指定的子路径来访问

> 更多细节可以看这个提案 https://github.com/jkrems/proposal-pkg-exports/

所以从 node v12 开始，又新增了几个字段：

- exports 更加详细地描述上述行为
- typesVersions 不同行为对应的 ts 类型文件

一个例子：

```json
{
  "name": "shared",
  // commonjs  入口文件
  "main": "./dist/index.js",
  // esm  入口文件
  "module": "./esm/index.js",
  "exports": {
    // 确保可以 import {} from 'shared/xxx'
    "./*": {
      // import 时引入的文件
      "import": "./esm/*.js",
      // require 时引入的文件
      "require": "./dist/*.js",
      // nodejs 环境时引入的文件
      "node": "./dist/*.js",
      // 浏览器环境，nodejs 环境会直接忽略
      "browser": "./brwser/*.js"
    },
    // 确保可以 import {} from 'shared/components'
    "./components": {
      "import": "./esm/components/index.js",
      "require": "./dist/components/index.js",
      "node": "./dist/components/index.js"
    }
  },
  "typesVersions": {
    "*": {
      // import {} from 'shared/xxx' 时的 ts 类型文件
      "*": ["./dist/types/*.d.ts"],
      // import {} from 'shared/components' 时的 ts 类型文件
      "components": ["./dist/types/components/index.d.ts"]
    }
  }
}
```

可以看到 exports 可以实现在不同环境定义不同的映射扩展：

- import: esm
- require: commonjs
- node: Nodejs 环境
- default: 通用 fallback
- browser: 浏览器
- 其他:
  - NODE_ENV=AAA,BBB 根据 AAA->BBB 的顺序来决定使用哪个 `exports[NODE_ENV]`

除了以上 exports 的行为，针对 import 也有个**提案** imports：

```json
{
  "name": "shared",
  "imports": {
    "#hehe": "./dist/hehe.js",
    "#shit/": "./dist/shit/"
  }
}
```

这样，在 shared 内部就可以：

```js
import { Hehe } from '#hehe';
import { Fuck } from '#shit/fuck';
```

- #xxx: 仅当前包内部可以使用，类似于 webpack 等的 alias 功能

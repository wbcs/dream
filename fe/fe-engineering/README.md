## 包管理

- verdaccio: 发布包到本地的代理中做测试，避免发布到真实 npm 出现 bug 的问题
- commitlint: 约束 `git commit` 指令

## 一些构建工具的对比

### tsc vs babel

有了 `typescript` 还需要 `babel` 吗？答案毫无疑问是肯定的。因为：

- tsc 不能使用一些草案语法
- tsc 只能将代码转换成 `tsconfig.json` 配置中的 `compilerOptions.target` ，而 `babel` 则支持更加灵活的配置
- `babel` 生成的目标代码体积会比 tsc 更小
- `babel` 的编译速度更快
  > 以上都指的是 `babel` 生成目标代码而言，对于 `type check` 那 `babel` 依然无法替换 tsc

原因：
ts 引入 `polyfill` 的方式是直接在入口文件中引入 core-js:

```js
import 'core-js';
```

而 `babel7` 可以根据配置，使用 `@babel/compat-data` 的数据来针对地做语法转换和 `API` 的 `polyfill`。

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": "last 2 version, > 1%, not dead",
        "corejs": 3,
        "useBuiltIns": "usage"
      }
    ]
  ]
}
```

1. 根据 targets 读取要支持的浏览器版本，根据目标环境的版本支持的所有特性中过滤掉支持的特性，剩下的就是不支持的特性。
2. 然后只针对这些特性做转换和 `polyfill` 即可。

> 除此之外，`babel` 还可以通过 `@babel/plugin-transform-runtime` 将全局的 corejs 的 import 转换成模块按需引入，进一步 `Tree-shaking` 掉无用代码

tsc 会在编译的过程中进行类型检查，检查类型需要综合多个文件的类型信息，需要对 `AST` 做类型推导，这个过程是比较耗时的。而 `babel` 不做（想做也做不了）`type check`，速度会快很多。

> 因为 tsc 类型检查拿到整个 project 的配置信息（tsconfig.json）并且需要对类型做引入、多个文件的 namespace、interface、enum 合并等等操作之后，才能进行 `type check`。而 `babel` 仅仅只是对单文件 parse 成 `AST` 然后遍历结点、转换结点。所以 `babel` 是无法实现类似 tsc 的类型检测的。
> 因此它只能直接将类型信息删除掉，于是导致有部分 ts 的语法 `babel` 是无法识别的：
>
> - const enume
> - 跨文件的 namespace 合并
> - export/import =
> - <type> variable 类型断言，只能是 variable as type (jsx)

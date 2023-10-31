# intro

顾名思义，将 source code 和 bundle 后的产物做映射的东西，方便排查问题。

# bundler source map

不同 bundler 对 source map 的支持度不一样：

- esbuild 行为类似 `cheap-source-map`，即 `quality: transformed`；
- tsc 行为类似 `source-map`，即 `quality: origin`；
- webpack 则更全面、灵活，支持多种参数，来满足不同场景下对映射程度和构建速度方面的平衡与取舍

## webpack

webpack 使用 `devtool` 来设置 source map 的行为。

### eval

不会生成 source map，格式大概是：

```js
eval(`
;// CONCATENATED MODULE: ./source-code-path/source-file-a.js
console.log('source code a')
;// CONCATENATED MODULE: ./source-code-path/source-file-b.js
console.log('source code b')
//# sourceURL=webpack://@scope/package-name/./output-path/main.js
`)
```

以 `;//concatenated module: 源代码对应源文件路径` 作为分隔符再加上源代码就是最终的产物格式。

eval 不会生成 source map，但是能够让人看到出错的代码大概位于哪个源文件，在开发模式用的较多。

<!--
- `eval`: 不会生成 source map，
- `cheap-module-source-map` -->

### source-map

打包后的产物结尾处会有 `//# sourceMappingURL=filename.js.map`

大致的结构：

```ts
interface SourceMap {
  // source map 版本号
  version: number
  // 对应打包后的文件名
  file: string
  // 记录位置信息的字符串
  mappings: string
  // 打包后的文件，包含了哪些源文件
  sources: string[]
  // 和 sources 一一对应，即源文件的内容
  sourcesContent: string[]
  // 源代码包含的所有变量、属性名
  names: string[]
  sourceRoot: string
}
```

demo:

```json
{
  "version": 3,
  "file": "main.js",
  "mappings": "mBAAO,SAASA,KAAOC,GACrBC,QAAQF,OAAOC,EACjB,CCQAE,SAASC,iBAAiB,SAAS,KAP7BC,KAAKC,SAAW,GAClBN,EAAI,QAEJA,EAAIO,KAIuC,G",
  "sources": [
    "webpack://@dp/webpack-demo/./src/shared/index.js",
    "webpack://@dp/webpack-demo/./src/index.js"
  ],
  "sourcesContent": [
    "export function log(...args) {\n  console.log(...args)\n}\n",
    "import { log } from './shared'\n\nfunction main() {\n  if (Math.random() > 0.5) {\n    log('fuck')\n  } else {\n    log(shit)\n  }\n}\n\ndocument.addEventListener('click', () => main())\n"
  ],
  "names": [
    "log",
    "args",
    "console",
    "document",
    "addEventListener",
    "Math",
    "random",
    "shit"
  ],
  "sourceRoot": ""
}
```

### inline

inline 顾名思义，将某些 sourcemap 信息 base64 编码后内联到 bundle 后的文件中。需要和其他关键词配合使用。

> 排列组合的顺序为 eval/inline、cheap、module、source-map

### cheap

cheap 顾名思义，生成的 source map 会更简洁一些，即不包含 loader(`quality: transformed`) 和 列 信息。需要和其他关键词配合使用。

### module

作用是映射 loader 转换前的源代码，和 cheap 配合使用的时候即为 只映射行信息 + `quality: origin`

# 如果选择 source map 的取值

在确保能够获取足够信息的前提下（能定位到 origin+列）：

- 开发环境下尽可能不要影响构建速度, 推荐 `eval/inline-cheap-module-source-map`
- 生产环境下尽可能不要影响用户体验，即不要把 sourcemap 内联到 bundle 后的产物中（inline、eval 不可选），推荐 `cheap-module-source-map`

# source map 映射原理

```json
{
  "version": 3,
  "file": "main.js",
  "mappings": "AAQAA,SAASC,iBAAiB,SAAS,KAP7BC,KAAKC,SAAW,GAClBC,QAAQC,IAAI,QAEZD,QAAQC,IAAIC,KAI+B",
  "sources": ["webpack://@dp/webpack-demo/./src/index.js"],
  "sourcesContent": [
    "function main() {\n  if (Math.random() > 0.5) {\n    console.log('fuck')\n  } else {\n    console.log(shit)\n  }\n}\n\ndocument.addEventListener('click', () => main())\n"
  ],
  "names": [
    "document",
    "addEventListener",
    "Math",
    "random",
    "console",
    "log",
    "shit"
  ],
  "sourceRoot": ""
}
```

可以看到 mappings 是由 `,` 分割，最多 5 个字符组成的字符串，每个由 `,` 分割元素的含义依次为：

- 转换后的代码在第几列（names、sourcesContent 都是一一对应的）
- 这个位置在 sources 的哪个文件
- 这个位置在转换前的第几行
- 这个位置在转换前的第几列
- 这个位置在 names 中属于哪个变量（可能是空，因为某些关键词是不会被压缩的）

以 AAQAA 为例：

```
A 000000(0); 构建后第 0 列
A 000000(0); 源文件是 `sources[0]`, `./src/index.js`
Q 010000(8); 源文件的位置是 第 8 行
A 000000(0); 源文件的位置是 第 8 列
A 000000(0), 源文件对应的变量/属性是  `names[0]`, `document`
```

# 总结

source map 有 `eval`, `inline`, `cheap`, `source-map`, `module` 等 5 个关键词

- eval、inline 会内联到 bundle 后的产物中
- cheap 不会保留列信息，且 `quality: transformed`；
- module `quality: origin`；

source map 的取值建议：

- 开发环境建议使用 `eval/inline-cheap-module-source-map`；
- 生产环境建议使用 `cheap-module-source-map`

source map 的原理：生成的 `.map` 文件里面存储了对应的 `.js` 文件在构建前的一些信息，通过 mappings 字段里的信息，能读出：

- 当前位置在构建后代码的哪一列？
- 当前位置是 sources 里的哪个文件？
- 当前位置在源代码里是第几行？
- 当前位置在源代码里是第几列？
- 当前位置（如果有）是 names 里的哪个变量/属性？

这些信息通过 base64+VLQ 的编码被保存了下来，当线上产物报错时，我们能够通过构建后代码的报错位置（哪一行那一列），就能找到其在源文件的内容了

附：https://www.murzwin.com/base64vlq.html

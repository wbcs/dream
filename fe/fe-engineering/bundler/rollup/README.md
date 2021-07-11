## 和 webpack 类似功能的一些插件

- `rollup-plugin-polyfill-node`: 顾名思义，很多 `nodejs` 的系统模块在浏览器是没有的，需要做 `polyfill`
- `rollup-plugin-terser`: 压缩打包的文件，和 `rollup-plugin-uglify` 只能压缩 `es5` 不同，它支持 `es6`
- `@rollup/plugin-commonjs`: `npm` 很多包都是基于 `commonjs` 来编写的，而 `rollup` 是使用 `esm` 构建的，所以在不支持 `esm` 的包支持 `esm` 之前，可以用这个插件将 `commonjs` 转换成 `esm`
- `@rollup/plugin-node-resolve`: 采用 `nodejs` 的模块解析策略，即 `node_moduls` 。它可以告诉 `rollup` 如何查找外部模块，如果不用的话，`rollup` 只会简单的 `import` 外部依赖（类似 `webpack` 将用到的所有包都当做 `externals` ）
- `@rollup/plugin-alias`: 类似 `webpack` 自带的 `alias`
- `@rollup/plugin-replace`: 类似 `webpack.DefinePlugin`
- `@rollup/plugin-babel`: 类似 babel-loader
- `rollup-plugin-typescript2`: 类似 ts-loader
- `rollup-plugin-postcss`: 类似 style-loader,css-loader,less-loader
- `@rollup/plugin-json`: for json

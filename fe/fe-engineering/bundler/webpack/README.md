# lib/index.js

这个文件是 webpack 的入口，webpack 入口干了一件事：创建 compiler，然后 `compiler.run()`。

```js
const compiler = createCompiler();
compiler.run((err, stats) => {
  compiler.close((_err) => {
    callback(err || _err, stats);
  });
});
return compiler;
```

compiler 有很多个 hook，每个 hook 都是 tapable 的某个 hook 的实例，这些 hook 会按照下列顺序：

- beforeRun: 干掉 cache
- run: 注册 cache data hook
- beforeCompiler：
- compiler：开始编译
- make：从 entry 分析依赖以及间接依赖 && 创建模块对象
- buildModule：构建模块
- seal：构建结构封装（结果不可再有变动）
- afterCompiler：完成构建，缓存数据
- emit：输出到 output

Hook 有 compiler，Factory 有 content：
compiler 进行 setup 和 create
content 则是 call

create 的时候根据 type return 对应类型的函数

HookCodeFactory 的 callTap 是执行一些插件，

webpack 入口文件：

创建 compiler，调用 run，return compiler

compiler 有很多 hook，每一个 hook 都是我们之前说的 tabable 的 ins。
这些 hook 会按照以下顺序执行：
常用的有 done、

# lib/index.js
这个文件是webpack的入口，webpack入口干了一件事：创建compiler，然后 `compiler.run()`。
```js
const  compiler = createCompiler()
compiler.run((err, stats) => {
  compiler.close(_err => {
    callback(err || _err, stats)
  })
})
return compiler
```
compiler有很多个hook，每个hook都是tapable的某个hook的实例，这些hook会按照下列顺序：
+ beforeRun: 干掉cache
+ run: 注册cache data hook
+ beforeCompiler：
+ compiler：开始编译
+ make：从entry分析依赖以及间接依赖 && 创建模块对象
+ buildModule：构建模块
+ seal：构建结构封装（结果不可再有变动）
+ afterCompiler：完成构建，缓存数据
+ emit：输出到output


Hook有compiler，Factory有content：
compiler进行setup和create
content则是call

create的时候根据type return对应类型的函数

HookCodeFactory的callTap是执行一些插件，


webpack入口文件：

创建compiler，调用run，return compiler

compiler有很多hook，每一个hook都是我们之前说的tabable的ins。
这些hook会按照以下顺序执行：
常用的有done、
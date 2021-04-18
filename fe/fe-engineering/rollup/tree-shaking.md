`Tree-shaking` 的本质是消除无用的 js 代码。无用代码消除在广泛存在于传统的编程语言编译器中，编译器可以判断出某些代码根本不影响输出，然后消除这些代码，这个称之为 `DCE`（dead code elimination）。

`Tree-shaking` 是 `DCE` 的一种新实现，它和传统 `DCE` 不太一样的地方在于，传统的 `DCE` 除了消除没有用到的代码以外，还会干掉不可能执行的代码，而 `Tree-shaking` 则关注于没有用到的代码。

Tree-shaking 之所以能够实现，得益于 ES6 import 的静态特性，使得模块的引入和 runtime 无关，这样才能进行静态分析。(这也是为什么 CMD 模块无法进行 Tree-shaking 的原因)

ES Module 特点：

- 只能在顶级 scope 出现
- 模块名只能是常量 string
- 引入的变量为 immutable

目前主流支持 Tree-shaking 的东东有三个：

- webpack
- rollup
- google closure compiler

> 其实他们的实现都用了代码压缩优化工具：uglify

rollup 只处理 function 和 import/export 的变量，其他不做任何优化。之所以这么做，是因为 JavaScript 太过于灵活了，它的动态特性使得对代码的静态分析变得异常困难。

- side effect => 如果打到一个 bundle，那这个 lib 注定与 Tree-shaking 无缘：
  所以目前的组件库都是一个组件打成一个目录/文件。那这样就不能{a,bc}这样子引入了。 目前有 main、module 两个 package.json 字段，指定入口，由入口去一个个引入，然后再 export 出来。美滋滋。但是 webpack 目前不支持导出 es module。所以打包最好用 rollup 咯

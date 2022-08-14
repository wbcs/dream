- 打包之后后的文件其实就是一个 IIFE，这个 IIFE 的参数是一个对象，对象的 key 是文件的 path，value 则是一个函数，这个函数的参数分别为：module 和 exports。body 是 eval(对应文件内容的 string):

```js
// src/index.js
const App = () => {
  return 'fuck you';
};

// 打包后：

(function (modules) {
  //
})({
  './src/index.js': function (module, exports) {
    eval(`const App = () => {\nreturn 'fuck you'\n}`);
  },
});
```

> 但是 production 下貌似是个数组？？

- loader 和 plugin 的不同：

  - loader 主要就是让 webpack 拥有了加载非 js 文件的能力
  - plugin 旨在拓展 webpack 的功能，让 webpack 更加灵活，webpack 运行的生命周期中会广播出许多事件，plugin 可以监听这些事件并且同过 webpack 提供的 API 来改变输出的结果

- webpack 的执行流程：串行过程：
  - init args：从 `config file` 和 `shell` 中得到 `args` ，得出最终 `args`
  - 开始编译：init compiler 对象，加载所有配置的 `plugin` ，执行 run 。
  - 确定 entry ：从配置文件得到所有的 `entry`
  - 编译模块：从 `entry` 出发，调用所有配置的 `loader` ，再找出对应的依赖，对依赖递归编译直到所有文件都被编译完成
  - 输出资源：根据依赖关系组装成一个个 `chunk` ，再把每个 `chunk` 转换成一个单独的文件， push 到 `outputList` （这一步是能够修改输出内容的最后机会）
  - 输出完成：根据 `output.path` 和 `output.filename` 确定路径和文件名，最终将输出内容写入文件。

# 为什么需要 webpack？

传统直接在 HTML 文件中通过 `<script>` 引入外链脚本的方式存在如下问题：

- 各个 `<script>` 之间存在隐式的依赖关系：比如后一个依赖前一个，那如果依赖不存在或者引入的顺序错误，都将导致错误
- 如果依赖被引入但是没有被使用，或者说只使用了依赖中的一小部分代码，浏览器都会多下载很多无用代码。

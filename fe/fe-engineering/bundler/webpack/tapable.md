# Tapable

```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} = require('tapable');

const hook = new SyncHook(['argname']);
hook.tap('id', (argname) => {});
hook.tap('id', (argname) => {});
hook.call('fuck');

const hook = new AsyncParallelHook(['argname']);
hook.tapAsync('id', (argname, cb) => {
  someAsyncAction().then(callback);
});
hook.promise('arg').then(() => {});
```

- XXXBailHook: `return` 不为 `undefined` ，会理科执行 `callAsync`
- XXXLoopHook: `return` 不为 `undefined` ，会持续执行当前的 `cb`
- XXXWaterfallHook: `return` 不为 `undefined` ，则 `return` 会作为下一个 `cb` 的参数
- XXXParallelHook: 并发执行，`tapAsync/tapPromise` 的回调都会在 `promise/callAsync` 之后同步执行
- XXXSeriesHook: 顺序执行，只有当前一个回调完毕之后才会执行下一个

> 对于 `tapPromise` ，上文上的 `return` 对应 `resolve` 的参数

# @TODO

还有俩 HookMap、MultiHook 回头说吧, 具体实现瞜一眼仓库就行了，没啥难度

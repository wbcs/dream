# requestIdleCallback
`requestIdleCallback`能够利用帧与帧之间的空闲时间来实行`js`，传递给`callback`的参数中可以判断当前是否还有空闲时间(`timeRemaining()`)。

因为浏览器有可能一直都没有空闲时间，这个`API`还提供了第二个参数`timeout`，一旦超时，即使没有空闲时间，也会强制执行`callback`。

```js
const queue = [/* some works */];
requestIdleCallback(task, { timeout: 2000 });

function task(deadline) {
  // 还有剩余时间，或者已经超时
  while (deadline.timeRemaining() > 0 || deadline.timeout) {
    doSomething();
  }
  // 没有剩余时间，也没超时,但是queue还没有被清空
  // 放在下一帧的空闲时间去执行
  if (queue.length) {
    requestIdleCallback(task, { timeout: 2000 });
  }
}
```

![](https://user-gold-cdn.xitu.io/2019/5/20/16ad41a81352c11b?w=1544&h=396&f=png&s=252562)

可以看到，requestIdleCallback是在task执行完毕、UI更新完成之后的空余时间执行的，如果有时间会在当前帧的空闲时间执行多次。
> 如果是在requestIdleCallback中再去更改DOM，又会重新出发layout、repaint。

因为这个API的兼容性问题，React最终选择使用requestAnimationFrame来[模拟实现](https://github.com/facebook/react/blob/v16.8.0/packages/scheduler/src/Scheduler.js#L455)它。
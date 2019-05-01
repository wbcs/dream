# 前言
Vue是使用Object.defineProperty()进行双向绑定，而React是通过setState进行更新的。那么这个setState具体干了啥呢？

# setState
> 以下所有代码都去掉了开发环境下的错误提示，仅仅关注核心部分。

先来找到setState的出生地：
```js
Component.prototype.setState = function(partialState, callback) {
  // 干掉warn代码
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
// updater在componentDidMount后会被修改为下面的这个东西

const classComponentUpdater = {
  enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);

    const update = createUpdate(expirationTime);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  }
};


```
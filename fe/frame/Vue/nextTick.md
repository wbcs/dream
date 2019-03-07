# Vue中的nextTick的原理
超级精简后的代码
```js
let pending = false;
const callbacks = []; // 全局的所有回调
function nextTick(cb) {
  callbacks.push(() => cb());
  if (!pending) {
    pending = true;
    Promise.resolve().then(() => {
      pending = false;
      [...callbacks].forEach(fn => fn());
    });
  }
}
```

其实原理很简单，调用 `nextTick` 首先将 `cb` 推入队列当中， 如果是第一次调用，则 `set` 一个微任务，这个微任务先将标志位还原，然后执行所有的 `callback` 。

之所以要将 `callbacks` 复制一遍，是为了保证同一层的 `nextTick` 在同一次 `micrtask` 中执行，因为有时候会在nextTick中再次执行 `nextTick` ，这个时候需要确保里面的(`callback`)在外层所有的nextTick(`callback`)执行完之后再执行。

当有多个 `nextTick` 的时候，异步代码会等到同步代码全部执行完后再执行，例如：
```js
vm.$nextTick(() => {
  console.log(0);
});
vm.$nextTick(() => {
  console.log(1);
});
vm.$nextTick(() => {
  console.log(2);
});
console.log('同步代码执行完毕');
```

> 这样，等到真正执行 `[...callbacks].forEach(fn => fn());` 的时候，callbacks里其实是有3个回调函数的。

# Vue的实现
`Vue` 之所以会写了将近一百行代码，是因为它需要考虑边界条件， 比如没有传入 `cb`  或者`cb`会报错、 没有传入`cb`， 但是传入的`context`等等这样的情况， 以及当宿主环境不支持**微任务**的时候, 如何高效优雅的降级为**宏任务**等等。

在这里其他边界情况一会po源码自己看。主要再说一下优雅降级的部分。

我在上面直接写了 `Promise.resolve().then(...)`, 在Vue中它是封装了两个函数：
+ microTimerFunc
+ macroTimerFunc
```js
if (!pending) {
  pending = true;
  if (useMacroTask) {
    macroTimerFunc()
  } else {
    microTimerFunc()
  }
}
```
它在Vue中的具体实现：
```js
let microTimerFunc
let macroTimerFunc
let useMacroTask = false

if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
} else {
  microTimerFunc = macroTimerFunc
}
```
> 之所以选择setImmediate作为第一优先选择，而不是setTimeout;是因为setTimeout需要轮询超时检测，setImmediate是不需要的,而后者的缺点则是兼容性问题（好像只有IE实现）

除了吧setTimeout放在最后、setImmediate放到第一优先级之外，还发现一个没见过的东西：MessageChannel。

这个API是用来实现两端通信的：
```js
const channel = new MessageChannel();
const { port1, port2 } = channel;
port1.onmessage = function() {};
port2.onmessage = function() {};
// 当portX调用postMessage的时候，会触发对方的onmessage事件
port1.postMessage('msg');
port2.postMessage('msg');
```
我们都知道`js`里的事件大部分都是异步的，这个也是，而且`onmessage`是一个`macrotask`，所以只需要其中一方把需要执行的异步任务回调给`port1`，然后立即令`port2.postMessage()`，就能够实现和`setImmediate`相同的效果，而且没有`setTimeout`的轮询效率问题。

# Vue源码
最后 po出Vue的nextTick源码（我感觉写的很操蛋，要不是我自己写了一下看的还挺费劲儿的）：
```js
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIOS, isNative } from './env'

const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
let microTimerFunc
let macroTimerFunc
let useMacroTask = false

if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}


if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
} else {
  microTimerFunc = macroTimerFunc
}

export function withMacroTask (fn: Function): Function {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    try {
      return fn.apply(null, arguments)
    } finally {
      useMacroTask = false    
    }
  })
}

export function nextTick (cb, ctx) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```
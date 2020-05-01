# 同步和异步
js代码分为两种：同步代码和异步代码。
![](https://user-gold-cdn.xitu.io/2017/11/21/15fdd88994142347?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

用文字描述的话：
+ 同步和异步代码分别进入不同的场所（但是最终的执行场所都是——**主线程**）
+ 同步代码首先进入**主线程**执行，异步代码则进入`Event Table`并注册回调
+ 当某事件发生时，`Event Table`会将对应注册的回调`push`到`Event Queue`中
+ 最后，当**主线程**中的任务都执行完毕，`monitoring process`会到`Event Queue`中读取对应的函数到**主线程**中，最终在**主线程**执行
+ 这个过程循环往复，称之为`Event Loop`
> 上面提到的某事件，不同的任务对应不同的事件，比如`setTimeout`，它对应的事件就是等到delay的时间到达；`onclick`则是对应的元素被点击

# setTimeout、setImmediate、setInterval
+ setTimeout: `time s`后将`cb`推入`Event Queue`，所以它不能保证time后`cb`一定执行，只是说time后将`cb`推入`Event Queue`而已
+ setImmediate: 立即将`cb`推入`Event Queue`
+ setInterval: 每隔`time`后将`cb`推入`Event Queue`中，同样的，它也不能保证每隔`time`执行一次`cb`，只能说每隔`time`将`cb`推入`Event Queue`一次，所以有可能主线程一直占用时间，等到读取`Event Queue`的时候，已经推入好多个`cb`了，这个时候相当于一段时间内不停地在执行`cb`（不过现在都对它有优化，当`Event Queue`中存在`cb`的时候不推入，但还是有可能刚刚取出`cb`还没执行完，又有新的`cb`推入进`Event Queue`中），所以最好使用`setTimeout`来模拟它。

## setTimeout(cb, 0) 和 setImmediate的区别
`setTimeout`会不断轮询判断时间是否到达，而`setImmediate`不会，所以前者更耗费性能一些，这也是`Vue`的`nextTick`降级处理的时候，将`setImmediate`放在第一位的原因。
> 标准提到，`setTimeout`的最低`time`为`4mm`

# promise、process.nextTick
上面提到异步，`ES6`之后，js中就有了不同类型的异步任务：
+ 微任务(micro-task): `script`整体代码、`setTimeout`、`setImmediate`等
+ 宏任务(macro-tast): `promise`、`node`中的`process.nextTick`等

异步任务会进入`Event Table`注册回调，有了不同的微任务后，推入的`Event Queue`也有了多种。不同的异步任务对应不同的`Event Queue`.

对应的，在执行完同步代码后，先情况微任务的队列，然后取出一个宏任务执行完毕后，再次清空微任务队列，再取出一个宏任务，以此往复。。。
> 不过`node`中貌似是对应微任务和宏任务都是一次性清空。


# 结语
`Event loop`是`js`实现异步的一种方法，也是`js`（宿主环境）的执行机制。而异步是因为`js`的单线程语言特性。顺带提一句，异步的底层肯定是多进程或多线程的。不要把`js`的单线程和`js`宿主环境的多进程混淆。
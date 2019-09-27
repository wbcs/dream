mobx最终要函数应该就是autorun了吧。

```js
const obj = observable({
  age: 20,
  name: 'Bruce'
})

autorun((() => {
  console.log(obj.age)
})

// 没反应
obj.name = 'BAT MAN'
// 打印21
obj.age = 21;
```
只有依赖的属性改变的时候才会去执行autorun的callback。

其中mobx-react，让React视图更新的核心就是直接让autorun包含render函数，这样当state变的时候就去执行render，命中率非常高。

# 实现思路
就不说Object.definedProperty这个东西了。直接说一下它的proxy版本

首先，当某个事件发生的时候去执行哪些callback，这些callback需要提前就存储好。对于observable的对象也是需要提前存储好的：
```ts
const proxies = new WeakMap()

function isObservable<T extends object>(obj: T) {
  return (proxies.get(obj) === obj)
}
```
将这些observable object存储之后，我们还需要知道obj的哪个key对应哪些监听：
```ts
const observers = new WeakMap<
  object,
  Map<key, Set<Observer>>
>()
```
还有一个存储就是监听callback的队列，因为一个callback可能依赖了多个key，在同步修改这多个key的时候肯定不能每次都去执行callback，一定是等这些修改都完成之后才执行：
```ts
const observerQueue = new Set()
```

再来两个全局的标志：
```ts
let pending: boolean = false
// 当前执行到autorun
let currentObserver: Observer = null
```

## 将对象变为observable
```ts
function observable(obj) {
  return proxies.get(obj) || observable.object(obj)
}
```
思路肯定是拦截对象的get和set
```ts
observable.obj = function(obj) {
  const proxy = new Proxy({}, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (!isPlainObject(res)) return res
      const isExistProxy = proxies.get(obj)
      if (isExistProxy) return isExistProxy
      if (currentObserver) {
        registerObserver(target, key)
        return observable.object(res)
      }
      return res
    },
    set(target, key, value, receiver) {

    },
  })
}
```
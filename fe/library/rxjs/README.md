# Pull和Push
`pull` 和 `push` 是两种不同的协议，描述了数据 `Provider` 如何和 `Consumer` 通信。

## pull
`Consumer`（也就是使用者）决定什么时候从 `Provider` 接收数据。 `Provider` 不知道什么时候将数据发送给`Consumer`。
> 典型的`React`，`React`不知道什么时候更新，从而暴露一个`setState`，开发者（ `Consumer` ）通过`setState`来告诉`React`

每个js函数都是一个pull系统，调用函数方是 `Consumer` ，函数本身是 `Provider` 。
> ES2015 generator函数和iterable是新的pull系统，调用iterator.next是 `Consumer`

## push
 `Provider`  确定什么时候把数据发送给 `Consumer` ， Consumber 是不知道什么时候接收数据的。
> 我们在写`Vue`的时候，我们的代码就是 `Consumer` ，`Vue`就是 `Provider` 。我们不知道什么时候接收数据。更新是交由`Vue`处理的。

js最常见的push类型是Promise。Promise本身是 `Provider` ，callback是 `Consumer` ， `Consumer` 不知道什么时候得到数据。

-|Provider|Consumer
-|-|-
pull|被动，在需要时产生数据|主动，决定什么时候请求数据
push|主动，自己决定什么时候产生数据|被动，对收到的数据进行处理

# Rxjs
`Rxjs` 引入 `Observables` ， 是一种用于 `JavaScript` 的新 `push` 系统。 一个 `Observables` 是多个数据的 `Provider`

```ts
import { Observable } from 'rxjs'

const observable = new Observable<number>(subscribe => {
  let num: number = 0
  const clear = setInterval(() => {
    subscribe.next(num++)
  }, 1000)
  return () => clearInterval(clear)
})

const unsubscribe = observable.subscribe((v) => {
  if (v >= 5) {
    // 非异步会报错哦，因为next执行之后，observable.subscribe的cb会立即同步执行
    unsubscribe.unsubscribe()
    return
  }
  console.log(v)
})
```
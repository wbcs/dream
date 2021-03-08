# Pull 和 Push

`pull` 和 `push` 是两种不同的协议，描述了数据 `Producer` 如何和 `Consumer` 通信。

| -    | Producer                       | Consumer                   |
| ---- | ------------------------------ | -------------------------- |
| pull | 被动，在需要时产生数据         | 主动，决定什么时候请求数据 |
| push | 主动，自己决定什么时候产生数据 | 被动，对收到的数据进行处理 |

> js 中常见的 pull 有 function，push 有 Promise

# Rxjs

`Rxjs` 引入 `Observables` ， 是一种用于 `JavaScript` 的新 `push` 系统。 一个 `Observable` 是多个数据的 `Producer`

## concept

- observable
- observer
- subscribe
- subscriber
- subscription

以上概念之间的关系用代码来表示：

```js
const observable = new Observalble((subscriber) => {});
const observer = {
  next(data) {},
  error(error) {},
  complete() {},
};
const subscription = observable.subscribe(observer);
```

## operators

- creation
  - of
  - range
  - interval
- pipeable
  - array-like:
    - map
    - mergeMap/flatMap
    - filter
    - reduce
    - find
    - findIndex
    - every
    - 
  - math
    - min
    - max
    - count
    <!-- - scan
  - throttle -->

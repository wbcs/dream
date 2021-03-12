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
- observer: 一个拥有 `next`, `error`, `complete` 方法的对象
- subscribe
- subscriber
- subscription: 一个拥有 `unsubscribe` 方法的对象

以上概念之间的关系用代码来表示：

```js
const observable = new Observalble((subscriber) => {});
const observer = {
  next(data) {},
  error(error) {},
  complete() {},
};
const subscription = observable.subscribe(observer);
subscription.unsubscribe();
```

`subscription` 可以 `subscription.add(anotherSubscription)`，这样 `subscription.unsubscribe()` 就可以取消对多个 `observable` 的观察; 当然也可以 `subscription.remove(anotherSubscription)` 来执行 `undo` 。

## operators

- creation:
  - of
  - range
  - interval
- pipeable:
  - array-like:
    - map
    - mergeMap/flatMap
    - switchMap: `switchMap(x => of(x, x * 2, x * 3))` return 会被 flat
    - filter
    - reduce
    - find
    - findIndex
    - every
  - math:
    - min
    - max
    - count
  - sideEffects:
    - tap: 对 observable 的每个 value 都会触发

## subject

subject 是特殊的 observable ，类似 EventEmitter 能够使同一个数据多播到多个 observable。

```ts
import { Subject, from } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe((v) => console.log(`shit: ${v}`));
subject.subscribe((v) => console.log(`fuck: ${v}`));

subject.next(1);
subject.next(2);

// shit: 1
// fuck: 1
// shit: 2
// fuck: 2
```

同时，subject 也是一个 observer。

```ts
import { Subject, from } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe((v) => console.log(`shit: ${v}`));
subject.subscribe((v) => console.log(`fuck: ${v}`));

const observalbe = from([1, 2, 3]);
observable.subscribe(subject);
// shit: 1
// fuck: 1
// shit: 2
// fuck: 2
// shit: 3
// fuck: 3
```

- BehaviorSubject: 被 `subscribe` 时，立即传递最新的值给 `observer`
- ReplaySubject(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): 重播在 `windowTime` 内的 `bufferSize` 个值
- AsyncSubject: `observable.complete()` 后，发送给 `observer` 最后一次的值

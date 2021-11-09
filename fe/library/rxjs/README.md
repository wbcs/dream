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

## Operators

Operators 是一些纯函数，这些纯函数接收前一个 observable 作为输入，生成一个新的 observable 作为输出。

我们自己写一个将 `Observable<number>` 值乘以 2 的 operator：

```ts
import { Observable, Observer, pipe } from 'rxjs';
import { of, map } from 'rxjs/operators';

function double() {
  return (observable: Observable<number>) =>
    new Observable((subscriber) => {
      const observer: Observer<number> = {
        next: (v) => subscriber.next(v * 2),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete,
      };
      const subscription = observable.subscribe(observer);

      return () => subscription.unsubscribe();
    });
}

of(1)
  .pipe(double())
  .subscribe((v) => {
    console.log(v); // 2
  });

// 当然 可以用已有的 operators 组合出一个新的 operator
function double() {
  return pipe(map((v) => v * 2));
}
```

### Hight-Order Operators

顾名思义，和高阶函数类似，是 value 为 Observable 的 Operators。

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
    - concatAll
    - withLastestFrom: `[v, arr[arr.length - 1]]`
  - math:
    - min
    - max
    - count
  - sideEffects:
    - tap: 对 observable 的每个 value 都会触发

## Observable

```js
import { Observable } from 'rxjs';

function producer(subscriber) {
  const clear = setInterval(() => {
    subscriber.next(performance.now());
  });

  return () => {
    clearInterval(clear);
  };
}

const observable = new Observable(producer);

// 每次 subscribe 都会新创建一个 observable
// 即 producer 会重新执行 subscribe 几次就执行几次
// 每个 observer 都会从头开始 接受所有的 value
const subscription = observable.subscribe((value) => {
  console.log(value);
});
```

- 单播：普通的 Observable，只能被一个 subscriber 监听
- 多播：不会从头开始接受数据，即能够被多个 subscriber 监听，Subject，其实就是对 source 进行了转发
- 广播：

## Subject

- `Subject` 是 `Observable` ，类似 `EventEmitter` 能够使同一个数据多播到多个 `Observable`
- `Subject` 是 `Observer` ，能够观察 Observable: `observable.subscribe(subject)`

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

from([1, 2, 3]).subscribe(subject);
// shit: 1
// fuck: 1
// shit: 2
// fuck: 2
// shit: 3
// fuck: 3
```

- `BehaviorSubject`: 被 `subscribe` 时，立即传递最新的值给 `observer`
- `ReplaySubject(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike)`: 重播在 `windowTime` 内的 `bufferSize` 个值
- `AsyncSubject`: `observable.complete()` 后，发送给 `observer` 最后一次的值

实现一个 `multicast`:

```ts

```

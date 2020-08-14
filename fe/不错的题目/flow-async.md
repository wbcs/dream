
```js
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const subFlow = createFlow([() => delay(1000).then(() => log('c'))]);
createFlow([
  () => log('a'),
  () => log('b'),
  subFlow,
  [() => delay(1000).then(() => log('d')), () => log('e')],
]).run(() => {
  log('done');
});
// 需要按照 a,b,延迟1秒  ,c,延迟1秒,   d,e, done 的顺序打印
```

```js
const createFlow = (() => {
  const id = Symbol('flow');
  return (taskQueue) => {
    const run = (cb = () => {}) => {
      timer = Date.now();
      const _run = (task) => {
        if (typeof task === 'function') {
          return delay(0).then(() => task());
        }
        if (Array.isArray(task)) {
          return createFlow(task).run();
        }
        if (task[id]) {
          return task.run();
        }
        return task;
      };
      return taskQueue
        .reduce((prev, task) => prev.then(() => _run(task)), Promise.resolve())
        .then(cb);
    };
    return { [id]: true, run };
  };
})();

let timer;
function log(...args) {
  console.log('timer:', Date.now() - timer, ...args);
}
```
> 这个其实和axios的拦截原理很类似。
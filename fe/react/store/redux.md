## middleware

```ts
import { createStore, combineReducers, applyMiddlewares } from 'redux';
import reducers from './reducers';

const store = createStore(
  combineReducers(reducers),
  applyMiddlewares(middleware0)
);

function middleware0({ getState, dispatch }) {
  return (next) =>
    (action, ...args) => {
      console.log('[middleware0] before next, state=', getState());
      const res = next(action, ...args);
      console.log('[middleware0] after next, state=', getState());
      return res;
    };
}

function middleware1({ getState, dispatch }) {
  return (next) =>
    (action, ...args) => {
      console.log('[middleware1] before next, state=', getState());
      const res = next(action, ...args);
      console.log('[middleware1] after next, state=', getState());
      return res;
    };
}
```

middware 的调用顺序是

- 当 dispatch 的时候，先调用 middleware0，此时 dispatch === middleware0；
- 在 middleware0 中调用 next 时，next 就是下一个中间件 return 的最内层的高函数；
- 以此类推；
- 最后一个 middleware 的 next 就是真正的 redux 的 dispatch。

所以根据这个要求，我们写一个 applyMiddlewares：

```ts
import { compose } from 'redux';

function applyMiddlewares(middlewares) {
  return (createStore) =>
    (...args) => {
      const store = createStore(...args);
      let dispatch = () => {};
      const middlewareApi = {
        getState: store.getState,
        dispatch,
      };
      // 先给所有 middleware 传入 api 参数
      // 结束之后的chains是 Array<(next) => xxx>
      const chains = middlewares.map((item) => item(middlewareApi));

      // 最终是需要调用真正的 store.dispatch 的
      dispatch = compose(...chains)(store.dispatch);

      return {
        ...store,
        dispatch,
      };
    };
}
```

这里一个比较重要的逻辑是 compose ，这里也来玩一下：

```ts
function compose(...fns) {
  return (dispatch) =>
    fns.reduceRight((prev, current) => current(prev), dispatch);

  // 或者，源代码的写法
  return fns.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}
```

到这里就可以发现，middleware 的执行顺序是从前到后，最后一个 middleware 的 next 是真正的原生 redux 的 dispatch 。中间两层高阶函数是被同步调用的

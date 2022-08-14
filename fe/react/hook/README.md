# 引入 hooks 的动机是什么？

- 逻辑复用：HOC 会导致嵌套地狱问题、namesapce 问题，render props 同样存在
- 副作用相关逻辑，有时候写多次（比如 fetch data 在 CDM、CDU），这有可能会造成数据的不一致性
- 因为生命周期的关系，很多不相关的副作用代码都聚合在一起,难以维护
- class 的一些问题：
  - 打包生成 handler 函数，体积比较大
  - 不易于 tree-shaking

# use

- useEffect 是异步的微任务 比 setTimeout 快没 Promise 快
- useLayoutEffect 是同步的， render 完就会调用

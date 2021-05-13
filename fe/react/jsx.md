jsx 的动机：允许用户在 JavaScript 书写类似 HTML 的视图。

好处：

- 能同时检查 JavaScript 和 HTML 视图
- 视图层了解 runtime context，加强 MVC 中 VC 的连接

## v17 jsx

改动主要是因为 Function Component 和 Class Component 的设计理念不同。

- 因为 v16 jsx 其实是 React.createElement， 所以使用 jsx 必须引入 react 默认导出. 后续期望自动导入
- props：

  - React 无法确定 props 会不会被用户修改，所以每次都需要对 props 进行一次 deepclone
  - key, ref：

    - 不传递，所以如果不进行 clone 就必须将 key 和 ref 从 props 中 delete 掉，这会导致引擎将 js 对象处理成 map-like
    - key 期望和 props 拆开传递, 这和 children 刚好相反
    - ref 期望不适用 React.forwardRef 即可传递

- children 原来总是在 runtime 时期判断是单个对象还是数组，然后进行拼接等操作。期望在编译期间即可确定. 原来是单独传递的，后续期望总是扔到 props 里
- defaultProps
  - 类组件如果存在 defaultProps， 那么在创建其元素时，需要每次都动态地检测 defaultProps 而不是在 class component 声明时就指定好。这是因为对于 `React.lazy()` 来说，在 `<LazyComponent>` 的时候 LazyComponent 其实还没有拿到真实的组件。所以需要在 `runtime/React.createElement` 时期每次都做检测
  - 函数组件废弃 defaultProps

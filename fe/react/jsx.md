`jsx` 的动机：允许用户在 JavaScript 书写类似 HTML 的视图。

好处：

- 能同时检查 JavaScript 和 HTML 视图
- 视图层了解 runtime context，加强 MVC 中 VC 的连接

## v17 jsx

改动的地方：

- 废弃 `module pattern` comoponents
- 废弃 `function component` 的 `defaultProps`
- 将 `defaultProps` 的解析实际移动到 render 时处理
- 废弃从对象展开中拿到 key `<Component {...hasKeyPropsObject}>`
- 废弃 string refs
- 将获取 `ref` 的操作移动到 render 和 `forwardRef` 时处理
- 废弃生产环境下的 `_owner` 字段
- `jsx` 转译采用新方式：

  - 总是将 children 作为 props 处理
  - 将 `key` 从 props 中分离出来
  - 可以不 import react

改动主要是因为 Function Component 和 Class Component 的设计理念不同，做出这些改动的动机：

- 当组件存在 `defaultProps` 时，需要在 `React.createElement` 时动态地测试，这导致 `jsx` 不能很好地优化
- 因为 React.lazy 组件的存在，导致在 `jsx` 转换时，有可能拿不到组件本身，就无法在 `jsx` 转译的时候就确定 `defaultProps`。因此在每一次 `React.createElement` 的时候都需要对组件进行测试，看其是否存在 `defaultProps`
- children 作为多个参数传递给 `React.createElement` ，这导致在 runtime 需要动态判断以确定其形状（对象还是数组，其实这一点在转译期间是能够确定的）
- `jsx` 的转译使用 `React.createElement` ，它是一个动态属性（意思就是说它是从 React 中读取的一个属性），而不是模块导出。这会导致 `Tree-shaking` 几乎不起作用，并且有少量的运行时开销
- React 无法确定 `props` 会不会被用户修改，所以每次都需要对 `props` 进行一次 deepclone
- `key` 和 `ref` 和其他 `props` 一同处理，但是又是不可传递的，所以即使 React 不去深度拷贝 `props`，也必须将 `key` 和 `ref` 从原 `props` 中删除，这会导致 js 引擎将对象处理为 `map-like`
- `key` 和 `ref` 能够从这种语法中得到 `<Component {...props} />` 这导致在 `jsx` 转译期间无法得知是否存在 `key` 或 `ref`，降低了编译期间的优化可操作性
- `jsx` 的转译必须包含 React 在 scope 中，这导致虽然只使用 `React.createElement` 但是却不得不包含 react 的默认导出。但实际上仅仅使用 `jsx` 语法而引入 react 是不必要的

用代码来表示(上面为 v16,下面是 v17)：

```jsx
<div {...props} key={key}>
  children
</div>;

import React from 'react';
React.createElement('div', { ...props, key: key }, children);

import { jsx } from 'react'; // auto
jsx('div', { ...props, children: children }, key);
```

## 和 fiber 的区别

- `jsx` 描述了一个 React 元素的内容, 不包括 scheduler、Reconciler、renderer 所需的信息
- fiber 则是根据 `jsx` 的内容生成的更广的数据结构，除了 `jsx` 中的信息外，还有优先级、组件的 state、被用于 renderer 的 tag（update,mount）

> fiber 会在 mount 时根据 `jsx` 被创建出来。更新时，Reconciler 会根据对比结果给 fiber 打上想要 renderer 如何操作的 tag

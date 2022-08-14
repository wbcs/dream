# Fragment

先来看一下它的使用场景：

```tsx
const Fragment: React.SFC<{}> = () => (
  <table>
    <tr>
      <Columns />
    </tr>
  </table>
);
```

因为 tr 的 children 只能是 th，但是组件又必须有一个根节点，所以 Fragment 就应允而生了

```tsx
const Columns: React.SFC<{}> = (
  <React.Fragment>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
  </React.Fragment>
);
```

内部实现的话，如果判断当前组件的 tag 是 React.Fragment，那就会直接渲染它的 children。

# Portals

Portal 提供了将子节点渲染到父节点以外的 DOM 节点的方案。

```tsx
ReactDOM.createPortal(children, DOM);
```

他的应用场景主要是需要子组件在视觉上跳出他的容器的情形。比如 overflow：hidden； z-index 这种情况。

## Portals 的行为

portal 能够 render 到任意位置，但是它的行为和 React 正常的节点行为是一致的。也就是说 portal 依然是 React tree，这个 tree 和 DOM tree 是分开的。这意味着 context、事件等等依然和正常的节点一样。

## 思想

要实现这样的功能，就需要在当前编写的位置，写个占位元素（portal 的 VNode 的 el 也是指向这个元素的），把对应的事件绑定到这个占位元素上，等到事件触发的时候再 dispatch 到我们真正要触发的位置上就行了。一般来说弄一个空白的文本节点即可。

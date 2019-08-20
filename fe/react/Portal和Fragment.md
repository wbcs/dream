# Fragment
先来看一下它的使用场景：
```tsx
const Fragment: React.SFC<{}> = () => (
  <table>
    <tr>
      <Columns />
    </tr>
  </table>
)
```
因为tr的children只能是th，但是组件又必须有一个根节点，所以Fragment就应允而生了

```tsx
const Columns: React.SFC<{}> = (
  <React.Fragment>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
  </React.Fragment>
)
```

内部实现的话，如果判断当前组件的tag是React.Fragment，那就会直接渲染它的children。

# Portals
Portal提供了将子节点渲染到父节点以外的DOM节点的方案。
```tsx
ReactDOM.createPortal(
  children,
  DOM
)
```
他的应用场景主要是需要子组件在视觉上跳出他的容器的情形。比如overflow：hidden； z-index这种情况。

## Portals的行为
portal能够render到任意位置，但是它的行为和React正常的节点行为是一致的。也就是说portal依然是React tree，这个tree和DOM  tree是分开的。这意味着context、事件等等依然和正常的节点一样。

## 思想
要实现这样的功能，就需要在当前编写的位置，写个占位元素（portal的VNode的el也是指向这个元素的），把对应的事件绑定到这个占位元素上，等到事件触发的时候再dispatch到我们真正要触发的位置上就行了。一般来说弄一个空白的文本节点即可。

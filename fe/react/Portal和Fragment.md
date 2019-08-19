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

内部实现的话，如果判断当前组件的tag是React.Fragment，那就会直接渲染它的children
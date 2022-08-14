# shouldComponentUpdate

这个生命周期钩子函数默认`return true`，也就是会更新的意思。

这里会不会更新指的是会不会执行`render`函数，如果`return false` 则可以不执行`render`使用之前的`elements`。否则会执行`render`得到新的`elements`，然后进行`diff`找出不同更新`DOM`。

# pureComponent

`pureComponent`默认会对组件的`state、props`进行一次`shallow diff`，如果和上一次完全相同，则在 SCU 中`return false`。以达到提升效率的目的。

大概的流程就是，`extends` 了 `pureComponent` 之后 组件就有了`tag`，表示当前组件是继承了`pureComponent`的组件，这样具体负责渲染`UI`的包在`SCU`的时候可以进行判断：如果是`pureComponent` 则进行一次`shallow diff`，否则直接在`SCU` `return true`。

但是这东西不能到处使用。

以下情况都不能用：

- 父组件传递`props`的时候，某些属性是内敛函数、内敛对象等形式传递的时候
- 存在`children`

因为这个时候，在`SCU`的时候会比较当前的`state`和`props`，因为`props`新传入的值有新创建的引用，所以比较的结果一定是`false`， `SCU`一定会`return true`。那这种`shallow diff`就没有意义了。`children`也是一样的道理，`jsx`本质就是函数调用， `return` 的是 `VNode` ，也就是对象，一样是不同的引用。

具体的 diff 流程：

```ts
if (Object.is(prevProps, nextProps)) return true;

if (
  typeof prevProps !== 'object' ||
  prevProps === null ||
  typeof nextProps !== 'object' ||
  nextProps === null
) {
  return false;
}

const prevKeys = Object.keys(prevProps);
const nextKeys = Object.keys(nextProps);

if (prevKeys.length !== nextKeys.length) return false;

return prevKeys.every(
  (key: string) =>
    nextProps.hasOwnProperty(key) &&
    Object.is(prevProps[key as keyof IProps], nextProps[key as keyof IProps])
);
```

> 稍微改了一下源码，自己写的 思路、算法都是一样的。

# React.memo

这个东西可以看做 function component 的 SCU，用法：

```tsx
const YourComponent: React.SFC<IProps> = (props) => (

)

export default React.memo(YourComponent, (prevProps: IProps, nextProps: IProps) => {
  if (Object.is(prevProps, nextProps)) return true

  if (
    typeof prevProps !== 'object' || prevProps === null ||
    typeof nextProps !== 'object' || nextProps === null
  ) {
    return false
  }

  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) return false

  return prevKeys.every((key: string) => (
    nextProps.hasOwnProperty(key)
    && Object.is(prevProps[key as keyof IProps], nextProps[key as keyof IProps])
  ))
})
```

> 同 pureComponent 是一模一样的。

# 总结

`pureComponent、React.memo` 这些优化点引入的正确用法是 `props`在变化较少的情况使用，解决了`props`没有改变，但是无谓的执行了`render`，有时候组件本身写了`style`、内敛函数等情况，导致得到的`jsx diff`的时候引用改变进行无谓更新的情形。

总的而言，就是如果你的组件有很多内敛但不会变的数据，`props`又不会频繁更新的情况，使用`pureComponent、React.memo`会让性能得到提升。

# React的diff
首先明确一点，`React`的`diff`算法不是`diff`算法。

在组件更新的时候，重新执行`render`(`Function component`是重新执行函数组件本身)，得到新的`tree`，`React`将新的`tree`和之前的`tree`进行比较并执行相应操作的过程就是`React`的`diff`。

`React`的`diff`有两个特点：
+ 给每个`node`提供一个`key`，如果新`node`的`key`和`old`的`key`相同，则会认为是同一个节点，只需要改变其属性即可；
+ 不同类型的组件生成不同的`tree`
> 在比较`tree`时是根据`root`的类型来执行不同的操作的。

# React diff的具体过程
## root结点类型不同
只要新旧`tree`的根节点的类型不同，`React`会直接干掉这个结点和其子结点重新构建。
+ 在干掉旧结点之前会执行 `componentWillUnmount`,然后干掉其`state`并把对应的`DOM`从切面删除
+ 新创建的结点对应的`DOM`被插入到页面时，插入前调用 `componentWillMount`，插入后 `componentDidMount`

比如：
```js
render() {
  return (
    flag
      ? <p>this is p</p>
      : <div>this is div</div>
  );
}
```
> 如果`flag`由`true`变为`false`，则`React`会直接干掉`p`重新搞一个`div`

## root结点类型相同
如果两个结点的类型相同，`React`会比较他们的属性，仅仅修改不同的属性。

比如：
```js
render() {
  return (
    flag
      ? <p>this is p1</p>
      : <p>this is p2</p>
  );
}
```
> 这个时候仅仅修改`innerHTML`即可。

## 组件的比较
组件的比较上面的步骤也适用，不过多了一些额外的东西：

更新组件的时候更新其`props`，然后调用 `componentWillReceiveProps`、`componentWillUpdate`，然后执行`render`。最后比较新得到的结点树和之前的结点树。

## 递归比较子节点
`React`会同时递归比较两棵树的子节点，发现差异的时候立即更新。
> 注意两棵树指的是`React`的结点树和`DOM`树。

如果新插入的结点在最后：
```html
<ul>
  <li>0</li>
  <li>1</li>
</ul>

<ul>
  <li>0</li>
  <li>1</li>
  <li>2</li>
</ul>
```
直接插入最后一个`li`即可。但是如果插入在最前面：
```html
<ul>
  <li>0</li>
  <li>1</li>
</ul>

<ul>
  <li>2</li>
  <li>0</li>
  <li>1</li>
</ul>
```
这个时候就需要修改前两个`li`，然后创建一个新`li`插入到最后。做了很多多余的事，`React`是通过给每个`li`添加一个`key`来解决这个问题的。
```html
<ul>
  <li key="first">0</li>
  <li key="second">1</li>
</ul>

<ul>
  <li key="third">2</li>
  <li key="first">0</li>
  <li key="second">1</li>
</ul>
```
这样，`React`发现`third`是一个新`key`，就会创建新的`li`，而原先就存在的`key`就视为之前的元素不变，最后将新`li`插入到前面即可。

从`key`的作用来看就知道为什么不推荐使用`index`作为可以了，因为如果某个`list`是会被重新排序的，那么`rerender`的时候`index`跟之前的`key`对应的就不是同一个结点了，但是`React`还是会认为是同一个结点就依次修改本来只是顺序改变的各个结点，做了很多多余的事情。

# 总结
`React`通过不比较不同类型结点子节点、给结点添加`key`成功的把`diff`弄成了`O(n)`，但是它因此也有一些缺点：
+ `key`不稳定时会造成对结点许多不必要的修改
+ 结点类型不同时即使子节点很多都可以复用`React`还是会干掉整个结点重新构建
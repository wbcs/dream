# 对 React 的一些思考

## 既然组件最后实质上是函数调用，那为什么不直接写函数调用，而要写成 jsx 的组件形式呢？

```tsx
const VNode = <Component props="some props" />;
```

最终等价于

```tsx
const VNode = Component({ props: 'some props' });
```

看起来好像是一样的,事实上组件（函数）确实最终是直接被调用的。之所以要写成组件的形式而不是立即写一个函数调用，是因为调用组件的操作最好交由 `React` 来完成。来看一个例子：

```tsx
const Super0: React.FC<IProps> = () => (
  <Container show={trueOrFalse}>
    <Child />
  </Container>
);
const Super1: React.FC<IProps> = () => (
  <Container show={trueOrFalse}>{Child()}</Container>
);

type IProps = {
  show: boolean;
  children: React.JSXElement;
};
const Container: React.FC<IProps> = ({ show, children }) => {
  if (!show) {
    return <div>empty</div>;
  }
  return <div>{children}</div>;
};
```

对于上面两个 `Super` ，结果肯定是一样的，但是在 `show` 是 `false` 的情况下，本不需要对 `Child` 进行求职，但是 `Super1` 却干了多余的事情， `Super2` 就没有。

> `Super2` 实际上只是得到一个 `VNode` ， 它的 `type` 是 `Child` ，调用会交由 `React` 去完成。

这很 Nice ，因为它既可以让我们避免不必要的渲染也能使我们的代码变得不那么脆弱。

## 既然受控组件会导致组件频繁 rerender，那为什么不直接使用非受控组件呢？

答案：因为 `React` 想要 control everything。

`React` 是一个用于构建视图的框架，也就是说页面上显示的一些 `View` ，都得对应于 `React` 的 `state` 。

但是表单元素的输入，它的值是浏览器原生去维护的，所以一旦 `React` 给了 `input` 一个 `value` ，在响应输入的时候， `input` 到底是以 `React` 的 `state` 为准还是以用户输入的为准？

`React` 给了用户两种选择：

- 受控组件：以 `React` 的 `state` 为准
- 非受控组件：以用户输入为准

`React` 的受控组件认为 `value` 不能单独存在，必须要有对应的 `onInput` 、 `onChange` 、 `disabled` 、 `readOnly` 事件、属性一起使用，以达到受控的目的。所以如果只提供一个 `value` ， `React` 内部会有默认的事件去阻止 `input` 使用用户输入的值，让它不可编辑。(内部存储 `jsx` 上次赋给他的值，只能由内部事件去修改)

因为 `value` 以 `state` 为准的原因，想要默认值就只能再定义一个属性了： `defaultXXX`

## 为什么异步渲染要分两个阶段？

异步渲染分**渲染阶段**和 **`commit` 阶段**。前者是异步的，后者是必须是同步的。

如果异步渲染不分阶段的话，那么可能让用户看到不部分更新的`UI`，而且也会让浏览器的样式在短时间内频繁的重绘，效率低下。

所以要解决这个问题就需要在某个部分确定最后的状态之后再通知浏览器更新，而确定状态的操作是安全的，不会让用户察觉到样式的改变，也不会让浏览器频繁重绘，所以可以是异步的（分片），而更新`UI`的过程如果弄成异步就不行了。

所以为了达到分片的目的，又要解决上述问题， `React` 就把整个更新的过程分为渲染阶段和 `commit` 阶段。

## 为什么 React 不采用响应式数据来提高效率？

通过遍历整个模型去设置细粒度的 `watcher` 会浪费时间，在很多有一种交互会导致或小或大的更新，细粒度的 `watcher` 订阅会浪费内存资源。

## 什么情况下 React 不太适合？

很多东西需要在同一时间内持续更新。这种情况如果使用 `React` 会导致不停地执行 `render` ，进行 `diff` 然后更新`UI`。这种情况没有直接细粒度订阅来的效率高。所以对于页面在短时间内频繁、持续更新的情况， `React` 没有 `Vue` 高效。

## 它有哪些缺点？？

- 合成事件：优点很多，不细说了。主要的缺点有两个：
  - 代码量增大， `React` 将近一半的代码都是自定义事件系统的
  - 合成事件和原生事件并存造成一定的混乱

# temp

一些关键方法

```js
function performUnitOfWork() {
  let next;
  next = beginWork(root, next);
  if (next === null) {
    completeUniteWork();
  } else {
    workInProgress = next;
  }
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork();
  }
}

function performSyncWorkOnRoot(root) {
  workLoopSync();
}

function beginWork() {
  performSyncWorkOnRoot(root);
  CommitRoot()
}

beginWork;
performSyncWorkOnRoot; // 同步任务入口
workLoopSync;
performUnitOfWork;
completeWork;
CommitRoot;

performConcurrentWorkOnRoot; // 异步渲染入口
```

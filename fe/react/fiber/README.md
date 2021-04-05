# 什么是 Fiber

Fiber 是 React16 引入的新的调度算法。fiber 是实现这个调度算法中的数据结构。

# 为什么要引入 Fiber

引入`Fiber`的原因是为了优化`React`的渲染问题：从`setState`起到渲染视图无法中断，一直占用`main`线程导致动画、用户交互等出现卡顿。而`Fiber`的引入就是为了解决这个问题。

浏览器将`GUI描绘`、`timer callback`、`event callback`、`js`、`request`统统放在一起执行，只有执行完一件事之后才能执行下一件事。如果有多余的时间，浏览器会对`js`进行`JIT`、热代码优化，以及内部对`reflow`的一些优化。

简单理解就是，让浏览器休息好才能跑得快。

# 基本概念

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 作为静态数据结构的属性
  this.tag = tag; // 组件类型 Function/Class/HostComponent
  this.key = key;
  this.elementType = null; // 同 type，在个别情况下不同，React.memo
  this.type = null; // 对于组件来说，就是组件本身，hostComponent 即为tagName
  this.stateNode = null; // 真实的DOM

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}
```

> fiber 中的 父节点 之所以要叫 return，是因为对应原先递归的 reconcile ，要退出当前 stack 返回上一级调用栈的操作就是 return。

React 会同时存在两颗 FiberTree。在 state 变更的时候，构建新的 UI 信息都是在内存中完成的(workInProgress Fiber)，完成之后替换掉当前正在使用的(currentFiber) FiberTree。他们通过一个相同的属性 alternate 相互引用。

> 这种在内存中构建并替换的技术叫做双缓存。

## 一些函数的功能

- ReactFiberBeginWork: 进入一个组件
- ReactFiberCompleteWork: 离开一个组件
- ReactFiberCommitWork: 将 change 映射至 DOM
- ReactFiberScheduler: 选择下一个需要 begin work 的组件
- ReactChildFiber: 对 children 插入/删除的 diff 过程

## 名词解释

- Reconciliation：diff，对 new tree 和 old tree 进行比较
- scheduling：什么时候去做这件事情
- hydrate: 注水，意思就是补齐 React 在 SSR 的时候缺少的【行为】，因为在 SSR 的时候得到的无非是一堆 string，没有绑定对应的事件。hydrate 就是要在 client 补齐这些。

# 什么是Fiber
Fiber是React16引入的新的调度算法。fiber是实现这个调度算法中的数据结构。

# 为什么要引入Fiber
引入`Fiber`的原因是为了优化`React`的渲染问题：从`setState`起到渲染视图无法中断，一直占用`main`线程导致动画、用户交互等出现卡顿。而`Fiber`的引入就是为了解决这个问题。

浏览器将`GUI描绘`、`timer callback`、`event callback`、`js`、`request`统统放在一起执行，只有执行完一件事之后才能执行下一件事。如果有多余的时间，浏览器会对`js`进行`JIT`、热代码优化，以及内部对`reflow`的一些优化。

简单理解就是，让浏览器休息好才能跑得快。

# 基本概念
## 一些函数的功能
+ ReactFiberBeginWork: 进入一个组件
+ ReactFiberCompleteWork: 离开一个组件
+ ReactFiberCommitWork: 将change映射至DOM
+ ReactFiberScheduler: 选择下一个需要begin work的组件
+ ReactChildFiber: 对children插入/删除的diff过程

## 名词解释
+ Reconciliation：diff，对new tree和old tree进行比较
+ scheduling：什么时候去做这件事情

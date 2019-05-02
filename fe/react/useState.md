# useState
`useState`在`ReactHooks.js`文件中
```js
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}

export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```
短短两行代码,其实 `useState` 就是 `ReactCurrentDispatcher.current.useState(initialState);`, 那这个东西又是什么呢？ `ReactCurrentDispatcher`其实跟 `setState`一样，具体的实现都没有在 `react` 包中，而是交由具体的平台代码来实现的，例如：`ReactDOM`、`RN`都有具体的实现，`react` 仅仅定义了他们的`API`。

> 所以，仅从`react`包中，只能知道，`useState`实际上是调用了具体平台的`useState`方法。

## useState的第一次加载
也就是类组件对应的mount阶段。React会执行mountIndeterminateComponent：
```js
function mountIndeterminateComponent(
  _current,
  workInProgress,
  Component,
  renderExpirationTime,
) {
  // ...
  let value;  // 渲染出来的虚拟组件
  value = renderWithHooks(
    null,
    workInProgress,
    Component,
    props,
    context,
    renderExpirationTime,
  );
  // ...
  workInProgress.tag = FunctionComponent;
  reconcileChildren(null, workInProgress, value, renderExpirationTime);
  return workInProgress.child;
}
```
第一次执行，得到渲染后的`VNode`并保存到`value`中，至于`VNode` 是如何映射为真正的`DOM`，这个不管。

## 更新
更新的时候，会调用updateFunctionComponnet:
```js
  let nextChildren; // 这里就保存着更新后的VNode
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    context,
    renderExpirationTime,
  );
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
```
更新阶段就是得到更新后的`VNode`，保存在`nextChild`中。

# 具体过程
`Fiber`结点中的`memoizedState`属性存储了上一次`render`计算出来的`state`，在类组件中这个`memoizedState`可以和`state`一一对应，但是在函数组件中（使用`hooks`）就不是了。

因为`React`不知道在一个函数组件中调用了几次`setState`，所以`React`把一个`hooks`对象存储在`memoizedState`中来保存函数组件的`state`。

`hooks`对象如下：
```js
export type Hook = {
  memoizedState: any,

  baseState: any,
  baseUpdate: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null,

  next: Hook | null,
};
```
> 重点关注memoizedState和queue、next就行了。

这几个key的意义为：
+ memoizedState：存储`useState`返回的结果
+ queue：缓存队列，存储在更新过程中应当执行的`dispatchs`,简单理解就是`setState`的调用。
+ next：指向下一次`useState`的`hook`对象。也就是说，每用一个`useState`，就会创建一个`hook`结点，这些结点组成一个链表存储在`Fiber`的`memoizedState`中。

注意区分`Fiber`的`memoizedState`，和`hook`的`memoizedState`:
+ Fiber.memoizedState: `Hook`对象;
+ Hook.memoizedState: `useState()`返回的值。

## 🌰
```js
import React, { useState } from 'react'
import './App.css'

export default function App() {
  
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Star');
  
  // 调用三次setCount便于查看更新队列的情况
  const countPlusThree = () => {
    setCount(count+1);
    setCount(count+2);
    setCount(count+3);
  }
  return (
    <div className='App'>
      <p>{name} Has Clicked <strong>{count}</strong> Times</p>
      <button onClick={countPlusThree}>Click *3</button>
    </div>
  )
}
```
看一下我从掘进盗的图：
![](https://user-gold-cdn.xitu.io/2019/4/30/16a6d5de6dd38821?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这是第一次点击`button`时，`Fiber.memoizedState`。跟我们上面说的一样，显示`useState(0)`的`hook`对象，它的`next`指向`useState('star')`的`hook`对象。

不过，它的`queue`不应该是`action: 1、2、3`吗？怎么显示顺序是`3、1、2`呢?不急，先来看一下`renderWithHooks()`。

## renderWithHooks
```js
// ReactFiberHooks.js
export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  props: any,
  refOrContext: any,
  nextRenderExpirationTime: ExpirationTime,
): any {
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber = workInProgress;
 
  // 如果current的值为空，说明还没有hook对象被挂载
  // 而根据hook对象结构可知，current.memoizedState指向下一个current Fiber.memoizedState
  nextCurrentHook = current !== null ? current.memoizedState : null;

  // 用nextCurrentHook的值来区分mount和update，设置不同的dispatcher
  ReactCurrentDispatcher.current =
      nextCurrentHook === null
      // 初始化时
        ? HooksDispatcherOnMount
  		// 更新时
        : HooksDispatcherOnUpdate;
  
  // 此时已经有了新的dispatcher,在调用Component时就可以拿到新的对象
  let children = Component(props, refOrContext);
  
  // 重置
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  const renderedWork: Fiber = (currentlyRenderingFiber: any);

  // 更新memoizedState和updateQueue
  renderedWork.memoizedState = firstWorkInProgressHook;
  renderedWork.updateQueue = (componentUpdateQueue: any);
  
   /** 省略与本文无关的部分代码，便于理解 **/
}
```

### 初始化
```js
const HooksDispatcherOnMount: Dispatcher = {
  // ...
  useState: mountState,
};

function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    last: null,
    dispatch: null, // 就是setCount
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    // Flow doesn't know this is non-null, but we do.
    ((currentlyRenderingFiber: any): Fiber),
    queue,
  ): any));
  return [hook.memoizedState, dispatch];
}
```
初始化的过程就是：保存初始值到`hook.memoizedState`中，初始化`hook.queue`并得到更新`state`的`dispatch`。最终返回`[hook.memoizedState, dispatch]`。

然后再来看一下`dispatch`：
```js
// 前两个参数已经bind
function dispatchAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  /** 省略Fiber调度相关代码 **/
  // 创建新的新的update, action就是我们setCount里面的值(count+1, count+2, count+3…)
  const update: Update<S, A> = {
    expirationTime,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  };
  // 重点：构建query
  // queue.last是最近的一次更新，然后last.next开始是每一次的action
  const last = queue.last;
  if (last === null) {
    // 只有一个update, 自己指自己-形成环
    update.next = update;
  } else {
    const first = last.next;
    if (first !== null) {
      update.next = first;
    }
    last.next = update;
  }
  queue.last = update;
  /** 省略特殊情况相关代码 **/
  // 创建一个更新任务
  scheduleWork(fiber, expirationTime);
}
```
可以看到，这里对`queue`进行了一些修改:`queue.last`指向最后一次的`setCount，queue.last.next`指向第一次的`setCount`。这也是为什么我们在偷到的图中看到`queue`的`action`是3、1、2的原因。`queue`是一个环形链表。

到现在就可以知道，第一次执行函数组件返回的`setCount`，跟更新后返回的`setCount`不是一个函数。

### 更新
```js
// 所以调用useState(0)返回的就是HooksDispatcherOnUpdate.useState(0)，也就是updateReducer(basicStateReducer, 0)
const HooksDispatcherOnUpdate: Dispatcher = {
  /** 省略其它Hooks **/
   useState: updateState,
}
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

// 没用的参数被我干掉了
function updateReducer(reducer) {
// 获取初始化时的 hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 开始渲染更新
  if (numberOfReRenders > 0) {
    const dispatch = queue.dispatch;
    if (renderPhaseUpdates !== null) {
      // 获取Hook对象上的 queue，内部存有本次更新的一系列数据
      // 我猜等价于hook.last.next,也就是第一个setCount
      const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      if (firstRenderPhaseUpdate !== undefined) {
        renderPhaseUpdates.delete(queue);
        let newState = hook.memoizedState;
        let update = firstRenderPhaseUpdate;
        // 获取更新后的state
        // 所有的setCount
        do {
          const action = update.action;
          // 此时的reducer是basicStateReducer，直接返回action的值
          newState = reducer(newState, action);
          update = update.next;
        } while (update !== null);
        // 对 更新hook.memoized 
        hook.memoizedState = newState;
        // 返回新的 state，及更新 hook 的 dispatch 方法
        return [newState, dispatch];
      }
    }
  }
}
  
// 对于useState触发的update action来说（假设useState里面都传的变量），basicStateReducer就是直接返回action的值
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}
```
也就是说，`setCount`只是触发了一次更新请求，数据真正被更新其实是在`useState`的时候。

### 总结
1.  当我们第一次调用`[count, setCount] = useState(0)`的时候，会创建一个`queue`。
2.  调用`mount`阶段返回的`setCount`时，会将新`state`存储在`queue`对应`update`的`action`中，然后触发一个更新请求。
3.  `React`在触发更新的时候，重新执行函数组件。就会再次执行`useState`，这个时候的`useState`和之前的`mountState`不同，是`updateState`。它会遍历`hook`对象的`queue`，得到最终新的`state。`并保存在`hook.momizedState`中，返回新值和新的触发器。


# 总结
我们来捋一遍：

类组件的`state`是一整个对象，存储在`Fiber`结点的`memoizedState`中。

函数组件的`state`是分散开的（一个`useState`就可以看做一个`state`），`React`是通过链表的形式，把这多个`state`组合在一起,**第一个结点**也是存放在`Fiber`结点的`memoizedState`中。
> 记住`Fiber.memoizedState`存储的是第一个`useState`对应的`hook`对象哦。

`React`是通过下面的方式来保存函数组件的状态的：
+ 每个`useState()`看做是一个`hook`对象
+ 第一个`useState()`的`hook`对象就是`Fiber.memoizedState`
+ 接着后面的`useState()`尾插至`next`属性
+ 每个`state`都有自己的更新（`setCount`,不止一个哦），这些都保留在`hook`对象的`queue`属性中
  + 这个queue是一个循环链表，它的`action`属性存储着每次`setCount`传进来的参数，也就是要更新的值

解决了`state`的存储问题，接下来就是更新了：
+ 每次调用`setCount`就会创建一个新`update`对象，更新的值存储在`action`中。然后将`update`放在`queue.last`中。最后请求更新。
+ `React`来决定什么时候触发更新。触发更新的时候会重新执行函数组件。
+ 重新执行`Function Component`时, `React`会根据`Fiber`结点中的`memoizedState`中保存的各个属性判断出是更新操作，`useState`就会执行更新逻辑：遍历当前`hook`对象的`queue`，取到每个`update`对象的`action`（调用`setCount`的时候已经把新的值存储在这儿了），拿到所有`setCount`中的最后一次的值。
+ 这个值就是最终应该更新的值，把它保存到`hook`对象的`memoizedState`属性中，`return [hook.memoizedState, dispatch];`

至此整个过程结束。之后的流程同上。

> 看完了这些，了了我之前的一个误区，我以前一直以为是在`setCount`更新完数据之后才触发`rerender`。现在才发现，其实`setCount`只是把要更新的新值存储起来，真正修改`state`的逻辑是在`useState`的时候。而且`mount`的`useState`跟update的`useState`不是同一个函数。
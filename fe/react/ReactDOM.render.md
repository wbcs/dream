# 写在前面的话
看源码很多时候不知道从何看起，现在知道了，`ReactDOM.render()`是一个入口方法。`React`的一切的一切，除了引入包执行代码以外，其他的一切都是从这个方法开始的。

我要从`ReactDOM.render()`一直到DOM挂载到真正的页面，看一看到底发生了啥。

**声明：以下大多数代码都被我精简过了。**

# ReactDOM.render
先来写个例子：
```js
function Test() {
  return <div onClick={() => alert('test')}>
    <span>123</span>
  </div>
}

function App() {
  const [counter, setCounter] = useState(0)
  return (
    <div onClick={() => setCounter(counter + 1)} id="hehe">
      counter {counter} times!
      <Test />
    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
```

先来看看`ReactDOM.render`是个啥：
```js
const ReactDOM = {
  render(element, container, callback) {
    return legacyRenderSubtreeIntoContainer(
      element,
      container,
      callback,
    );
  },
};
```
> 很简单，我很费解为什么你要这么写 ，我草， 这么写跟直接写在这有啥区别，还多调用一次函数。效率更低。

## legacyRenderSubtreeIntoContainer
不废话了
```js
function legacyRenderSubtreeIntoContainer(
  children,
  container,
  callback,
) {
  // mount的时候没有这个属性，值为undefined
  let root = container._reactRootContainer;
  let fiberRoot;
  if (!root) {
    // 干掉container里的元素，return new ReactSyncRoot(container, false, false)
    // 得到一个root, 在这个过程中创建了根fiber，也就是下面那行的fiberRoot
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      false,
    );
    fiberRoot = root._internalRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        // 省略得到context，值就是null
        originalCallback.call(null);
      };
    }
    // Initial mount should not be batched.
    // 省略了一些东西，但是等价的
    updateContainer(children, fiberRoot, null, callback);
  }
  return getPublicRootInstance(fiberRoot);
}
```
> `mount`的时候一定会进入`if`中，下面具体看看干啥了

## legacyCreateRootFromDOMContainer
这个函数就不写出来了，说一下它的作用：

它创建了一个`fiberRoot`，也就是`React`调度过程中保存了许多信息的一个对象。还创建了`rootFiber`。`legacyCreateRootFromDOMContainer`执行了一下几个函数。
```js
function ReactSyncRoot(container) {
  this._internalRoot = createFiberRoot(container, false, false);
}
function createFiberRoot(containerInfo) {
  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  var uninitializedFiber = new FiberNode(HostRoot, null, null, 4);
  var root = {
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      pingCache: null,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate: false,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,

      interactionThreadID: tracing.unstable_getThreadID(),
      memoizedInteractions: new Set(),
      pendingInteractionMap: new Map()
    };

  uninitializedFiber.stateNode = root;

  return root;
}
```
可以看到`createFiberRoot`中还创建了`fiberROot`。其中`root`就是`fiberRoot`，`uninitializedFiber`是`rootFiber`。它们的区别是：

+ rootFiber：比较好理解，它是一个`fiber`，一个根`fiber`，React16的调度算法`Fiber`的数据结构就是`fiber`。React中每一个元素（原生html或者组件）都对应一个`fiber`，这个`fiber`就是整个`fiber`树的根。
+ fiberRoot：它是整个调度过程中的一个保存许多重要信息的`root`对象。

> 它们是一个循环引用。
```js
fiberRoot.current = rootFiber;
rootFiber.stateNode = fiberRoot;
```
附上fiberNode的结构：
```js
function FiberNode(tag, pendingProps, key, mode) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null; // 父Fiber结点
  this.child = null;  // 第一个子Fiber
  this.sibling = null; // 第一个右兄弟Fiber
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;  // 存储元素/组件的props
  this.updateQueue = null;
  this.memoizedState = null;  // 存储组件的state，元素为null。class组件就是state，function组件则是由hooks对象组成的单链表
  this.contextDependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;

  if (enableProfilerTimer) {  // 一般都是true
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    // It's okay to replace the initial doubles with smis after initialization.
    // This won't trigger the performance cliff mentioned above,
    // and it simplifies other profiler code (including DevTools).
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }

  {
    this._debugID = debugCounter++;
    this._debugSource = null;
    this._debugOwner = null;
    this._debugIsCurrentlyTiming = false;
    this._debugHookTypes = null;
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
      Object.preventExtensions(this);
    }
  }
}
```
一句话总结`legacyCreateRootFromDOMContainer`，它创建了`fiberRoot`和`rootFiber`。当然其他子元素都会在执行的之后递归调用，等到进来render就已经都创建好了。

# updateContainer
`legacyCreateRootFromDOMContainer`之后，取出我们刚刚创建的`fiberRoot`跟`rootFiber`（代码中的`root`）。
```js
  // 干掉container里的元素，return new ReactSyncRoot(container, false, false)
  // 得到一个root, 在这个过程中创建了根fiber，也就是下面那行的fiberRoot
  root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
    container,
    false,
  );
  fiberRoot = root._internalRoot;
  if (typeof callback === 'function') {
    const originalCallback = callback;
    callback = function() {
      // 省略得到context，值就是null
      originalCallback.call(null);
    };
  }
  // Initial mount should not be batched.
  // 省略了一些东西，但是等价的
  updateContainer(children, fiberRoot, null, callback);
}
return getPublicRootInstance(fiberRoot);
```

```js
function updateContainer(element, container, parentComponent, callback) {
  var currentTime = requestCurrentTime(); // 得到一个currentTime, 用这个值来计算expirationTime。这个值具体是什么意思不用管，重要的expirationTIme
  // expirationTime越大优先级越高
  var expirationTime = computeExpirationForFiber(currentTime, container.current);
  return updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback);
}
```
得到了优先级`expirationTime`，之后又干了一些无关紧要的初始化工作不管他，直接看下面：
```js
// 完了会执行这两个函数
// update是一个对象，存储了一些和更新有关的信息
// current$$1就是上文中提到的rootFiber
enqueueUpdate(current$$1, update);
scheduleWork(current$$1, expirationTime);
```
## enqueueUpdate
```js
function enqueueUpdate(fiber, update) {
  // Update queues are created lazily.
  var alternate = fiber.alternate;
  var queue1 = void 0;
  var queue2 = void 0;
  if (alternate === null) {
    // 进入说明现在仅有一个fiber
    // There's only one fiber.
    queue1 = fiber.updateQueue;
    queue2 = null;
    // 其实上面执行完queue1、queue2都他妈是null
    if (queue1 === null) {
      // 创建更新队列
      queue1 = fiber.updateQueue = {
        baseState: fiber.memoizedState,
        firstUpdate: null,
        lastUpdate: null,
        firstCapturedUpdate: null,
        lastCapturedUpdate: null,
        firstEffect: null,
        lastEffect: null,
        firstCapturedEffect: null,
        lastCapturedEffect: null
      };
    }
  }
  // 删除了不会进入的else
  if (queue2 === null || queue1 === queue2) {
    // There's only a single queue.
    appendUpdateToQueue(queue1, update);
  }
  // 删除了不会进入的else和警告代码
}
// appendUpdateToQueue就是把update 加入到queue中
// queue中的lastUpdate的next指向firstUpdate，是一个循环链表
function appendUpdateToQueue(queue, update) {
  // Append the update to the end of the list.
  if (queue.lastUpdate === null) {
    // Queue is empty
    queue.firstUpdate = update;
  } else {
    queue.lastUpdate.next = update;
  }
  queue.lastUpdate = update;
}
```
经过删减看起来就简洁多了。总结一下`enqueueUpdate`，它其实就干了一件事，创建`rootFiber.updateQueue`，这个`updateQueue`中的`baseState`保存了自己的`memoizedState`，把`update`对象保存到自己的属性中。

## scheduleWork
开始调度工作
```js
function scheduleWork(fiber, expirationTime) {
  var root = scheduleWorkToRoot(fiber, expirationTime);

  markPendingPriorityLevel(root, expirationTime);
  // isCommitting应该是如果是之后更新操作，提交时会为ture
  // nextRoot其实是null
  if (
  // If we're in the render phase, we don't need to schedule this root
  // for an update, because we'll do it before we exit...
  !isWorking || isCommitting$1 ||
  // ...unless this is a different root than the one we're rendering.
  nextRoot !== root) {
    var rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }
}
// ....
// 执行了一堆看不懂的代码，重要的是会执行这个
// 相当于document.createElement
var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);
// 把children都弄进去
appendAllChildren(instance, workInProgress, false, false);

finalizeInitialChildren(instance, type, newProps, rootContainerInstance, currentHostContext)
```
我们重点来看看：`finalizeInitialChildren`
```js
function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
  setInitialProperties(domElement, type, props, rootContainerInstance);
  return shouldAutoFocusHostComponent(type, props);
}

// setInitialProperties中会给元素添加props
// 具体内容就不写了，无非跟大家想的一样，for in 添加对应属性
// React也一样  就是多了一些边界情况的思考而已
// 不过要看的是它在执行的过程中跑了一行ensureListeningTo(rootContainerElement, propKey);
setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);
```

## listenTo
在`setInitialDOMProperties`中把`props`映射到`DOM`上。但是对应的事件可没有直接映射到`DOM`上。我们都知道`React`将所有的事件都委托到了`document`上，而干这件事的地方就在这里（老天爷，我终于找见了，真难弄😿）。
```js
// ensureListeningTo中listenTo(registrationName, doc);
// registrationName是事件名称onClick等
// mountAt就是document  这就是传说中的React时间委托
function listenTo(registrationName, mountAt) {
  // 保存了已经在document上监听的事件，一个对象
  var isListening = getListeningForDocument(mountAt);
  // React事件名转换为原生事件名称
  // onClick => click
  var dependencies = registrationNameDependencies[registrationName];

  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      switch (dependency) {
        case TOP_SCROLL:
          trapCapturedEvent(TOP_SCROLL, mountAt);
          break;
        case TOP_FOCUS:
        case TOP_BLUR:
          trapCapturedEvent(TOP_FOCUS, mountAt);
          trapCapturedEvent(TOP_BLUR, mountAt);
          // We set the flag for a single dependency later in this function,
          // but this ensures we mark both as attached rather than just one.
          isListening[TOP_BLUR] = true;
          isListening[TOP_FOCUS] = true;
          break;
        case TOP_CANCEL:
        case TOP_CLOSE:
          if (isEventSupported(getRawEventName(dependency))) {
            trapCapturedEvent(dependency, mountAt);
          }
          break;
        case TOP_INVALID:
        case TOP_SUBMIT:
        case TOP_RESET:
          // We listen to them on the target DOM elements.
          // Some of them bubble so we don't want them to fire twice.
          break;
        default:
          // 以click为例子，会走到这
          // By default, listen on the top level to all non-media events.
          // Media events don't bubble so adding the listener wouldn't do anything.
          var isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
          // 关于媒体的事件，play、pause等等
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt);
          }
          break;
      }
      isListening[dependency] = true;
    }
  }
}

// 直白一点把参数重命名了
function trapBubbledEvent(click, document) {
  if (!document) {
    return null;
  }
  const dispatch = dispatchInteractiveEvent
  addEventBubbleListener(
    document,
    getRawEventName(click), // 这东西好像有的事件名称需要改一下还是咋的，一般就是对应的事件名称
    dispatch.bind(null, click)
  );
  // 上面的代码其实就是:
  // document.addEventListener(getRawEventName(click), dispatch.bind(null, click), false);
}
// 上面bind的函数其实是这个
function dispatchInteractiveEvent(click, nativeEvent) {
  interactiveUpdates(dispatchEvent, click, nativeEvent);
  // 这东西其实就是
  // dispatchEvent(click, nativeEvent);
}
```
至此，`DOM`的创建就完成了，有了`DOM`、`DOM`有了对应的`props`。事件也委托到了`document`上。那我们现在先不急着回溯，看看看触发事件的时候`React`会怎么做。

# React事件原理
细心的童鞋已经发现了，`dispatchInteractiveEvent`的`dispatchEvent`并不是参数传进来的。它是一个函数：
```js
function dispatchEvent(topLevelType, nativeEvent) {
  // topLevelType 就是事件名称
  var nativeEventTarget = getEventTarget(nativeEvent);
  // 上面的判断跟取target就不说了
  // 这里是根据target来取出对应元素的fiber
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);
  if (targetInst !== null && typeof targetInst.tag === 'number' && !isFiberMounted(targetInst)) {
    targetInst = null;
}

  var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);

  try {
    handleTopLevel(bookKeeping)
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}
```

我们来看看`React`是怎么通过一个`DOM`得到其对应的`fiberNode`的：
```js
function getClosestInstanceFromNode(node) {
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey];
  }

  while (!node[internalInstanceKey]) {
    if (node.parentNode) {
      node = node.parentNode;
    } else {
      // Top of the tree. This node must not be part of a React tree (or is
      // unmounted, potentially).
      return null;
    }
  }

  var inst = node[internalInstanceKey];
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber, this will always be the deepest root.
    return inst;
  }

  return null;
}
```
好了，非常简单，`React`通过给原生`DOM`打内部`tag`，取到其对应的`fiber`。而如果当前`target`没有内部`tag`，那么会一直向上查找，最终得到离`target`最近的有`fiber`的父元素。目前我遇到的`HTML`，无论是否添加`props`、事件，都会有对应的`fiber`。
> `React`把`fiber`直接存储到了对应的`DOM`上，然后通过`React`制定的`tag`取出。

ok，有了`fiber`，`fiber`的`memorizedProps`上又存储了元素所有的属性，当然也包括各种事件了。不用看我们都知道该咋弄了。

得到`fiber`之后，又调了个函数，这个函数返回了一个对象，它把对应的`fiber`、事件类型、跟`DOM`都存好`return`出来：
```js
  return {
    topLevelType: topLevelType,
    nativeEvent: nativeEvent,
    targetInst: targetInst,
    ancestors: []
  };
```

## 更新阶段
```js
function batchedUpdates(fn, bookkeeping) {
  if (isBatching) {
    // If we are currently inside another batch, we need to wait until it
    // fully completes before restoring state.
    return fn(bookkeeping);
  }
  isBatching = true;
  try {
    return fn(bookkeeping);
  } finally {
    // Here we wait until all updates have propagated, which is important
    // when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    // Then we restore state of any controlled component.
    isBatching = false;
    var controlledComponentsHavePendingUpdates = needsStateRestore();
    if (controlledComponentsHavePendingUpdates) {
      // If a controlled event was fired, we may need to restore the state of
      // the DOM node back to the controlled value. This is necessary when React
      // bails out of the update without touching the DOM.
      _flushInteractiveUpdatesImpl();
      restoreStateIfNeeded();
    }
  }
}

// batchedUpdates中的第一个参数
function handleTopLevel(bookKeeping) {
  // fiber
  var targetInst = bookKeeping.targetInst;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = targetInst;
  /** 
   *  do把target对应的fiber push到队列
   *  然后得到root container, 一般就是我们的App组件fiber
   *  也就是得到包含当前元素的组件对应的fiber
  */
  do {
    var root = findRootContainerNode(ancestor);
    bookKeeping.ancestors.push(ancestor);
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);
  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    runExtractedEventsInBatch(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}

function runExtractedEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  // 一个class   应该是当前事件对应的event类
  var events = extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
  runEventsInBatch(events);
}

function runEventsInBatch(events) {
  // 正常就是events
  eventQueue = accumulateInto(eventQueue, events);

  // Set `eventQueue` to null before processing it so that we can tell if more
  // events get enqueued while processing.
  var processingEventQueue = eventQueue;
  eventQueue = null;

  // 就是executeDispatchesAndReleaseTopLevel.call(undefined, processingEventQueue)
  // 这里去执行事件回调
  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
  // This would be a good time to rethrow if any of the event handlers threw.
  rethrowCaughtError();
}
var executeDispatchesAndRelease = function (event) {
    executeDispatchesInOrder(event);
    event.constructor.release(event);
};
// 执行逻辑
function executeDispatchesInOrder(event) {
  // 顾名思义，绑定事件的fiber和cb队列
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and Instances are two parallel arrays that are always in sync.
      // 执行回调的地方, 绕了一圈  其实最后就是个这  func.apply(context, funcArgs);
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}
```
👌至此 ，整个事件调度的过程就完成了。

## 继续我们的render
刚刚既然看到了`React`的事件委托，就多说了两句。回归`ReactDOM`这里。我们执行到`listenTo`.给`DOM`设置了`props、document`上委托了事件，完了以后又干了一堆初始化工作(看不懂 瞎猜的)。

我打了多个断点，来确定到底什么时候`mount`到页面中，最终回到了`performWorkOnRoot`这个函数。其中执行了`completeRoot`，这个函数完成了对`DOM`的挂载。哦不，最终还是他妈的到 `commitPlacement` 这里便是最终的`mount`之处 欧耶。
```js
function commitPlacement(finishedWork) {
  if (!supportsMutation) {
    return;
  }

  // Recursively insert all host nodes into the parent.
  var parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  var parent = void 0;
  var isContainer = void 0;

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentFiber.stateNode;
      isContainer = false;
      break;
    case HostRoot:
      parent = parentFiber.stateNode.containerInfo;
      isContainer = true;
      break;
    case HostPortal:
      parent = parentFiber.stateNode.containerInfo;
      isContainer = true;
      break;
    default:
      invariant(false, 'Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.');
  }
  if (parentFiber.effectTag & ContentReset) {
    // Reset the text content of the parent before doing any insertions
    resetTextContent(parent);
    // Clear ContentReset from the effect tag
    parentFiber.effectTag &= ~ContentReset;
  }

  var before = getHostSibling(finishedWork);
  // We only have the top Fiber that was inserted but we need to recurse down its
  // children to find all the terminal nodes.
  var node = finishedWork;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      if (before) {
        if (isContainer) {
          insertInContainerBefore(parent, node.stateNode, before);
        } else {
          insertBefore(parent, node.stateNode, before);
        }
      } else {
        if (isContainer) {
          // 以我们的例子最终会到这里
          appendChildToContainer(parent, node.stateNode);
        } else {
          appendChild(parent, node.stateNode);
        }
      }
    } else if (node.tag === HostPortal) {
      // If the insertion itself is a portal, then we don't want to traverse
      // down its children. Instead, we'll get insertions from each child in
      // the portal directly.
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === finishedWork) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
```

谢天谢地，老子终于到挂载DOM了。

# 总结
我们把大概的流程过一遍：
1. `jsx`由`babel`转译为`React.createElement`，完成之后进入`ReactDOM.render()`方法内（注意，进来之后所有的元素就`over`了）
2. 创建`fiberRoot`和`rootFiber`: 前者是调度过程中存储各种信息的对象，后者是我们的跟组件对应的`fiber`。也是整个`fiber`树的根。
3. 初始化: 把各种信息保存到`fiber`当中，什么`props、state`都会存储到`fiber`的对应属性内。
4. 创建真正的DOM: 并且把子结点都`append`到父节点当中
5. 初始化DOM：将存储在`fiber`中的信息，都射影到真正的`DOM`中。修改其对应属性。这个过程中还包括对应的事件。不过这些事件都会直接`addEventListener`到`document`中
6. 再执行了一些我看不懂的操作，，，
7. 最终进入挂载阶段。把我们的根组件`append`到`container`之中

至此，整个挂载过程已经完毕。
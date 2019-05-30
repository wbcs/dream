# ReactDOM.render
文中所有代码都被我干掉了无用、冗余部分，但都是等价的。
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

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
```

# legacyRenderSubtreeIntoContainer
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
> mount的时候一定会进入if中，下面具体看看干啥了
## legacyCreateRootFromDOMContainer
这个函数就不写出来了，说一下它的作用：

它创建了一个fiberRoot，也就是React调度过程中保存了许多信息的一个对象。还创建了rootFiber。legacyCreateRootFromDOMContainer执行了一下几个函数。
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
可以看到createFiberRoot中还创建了fiberROot。其中root就是fiberRoot，uninitializedFiber是rootFiber。它们的区别是：

rootFiber：比较好理解，它是一个fiber，一个根fiber，React16的调度算法Fiber的数据结构就是fiber。React中每一个元素（原生html或者组件）都对应一个fiber，这个fiber就是整个fiber树的根。
fiberRoot：它是整个调度过程中的一个保存许多重要信息的root对象。

> 它们是一个循环引用。
fiberRoot.current = rootFiber;
rootFiber.stateNode = fiberRoot;

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
一句话总结legacyCreateRootFromDOMContainer，它创建了fiberRoot和rootFiber。

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
## updateContainer
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
在setInitialDOMProperties中把props映射到DOM上。但是对应的事件可没有直接映射到DOM上。我们都知道React将所有的事件都委托到了document上，而干这件事的地方就在这里（老天爷，我终于找见了，真难弄😿）。
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

function trapBubbledEvent(topLevelType, element) {
  if (!element) {
    return null;
  }
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;
  addEventBubbleListener(
    element,
    getRawEventName(topLevelType),
    dispatch.bind(null, topLevelType)
  );
}
```
至此，DOM的创建就完成了，有了DOM、DOM有了对应的props。接下来回溯到函数completeUnitOfWork


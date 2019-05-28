```js
const ReactDOM = {
  render(element, container, callback) {
    return legacyRenderSubtreeIntoContainer(
      element,
      container,
      callback,
    );
  },
}

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
function updateContainer(element, container, parentComponent, callback) {
  var currentTime = requestCurrentTime();
  var expirationTime = computeExpirationForFiber(currentTime, container.current);
  return updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback);
}


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
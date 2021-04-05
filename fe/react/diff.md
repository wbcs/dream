# React 的 diff

首先明确一点，`React`的`diff`算法不是`diff`算法。

在组件更新的时候，重新执行`render`(`Function component`是重新执行函数组件本身)，得到新的`tree`，`React`将新的`tree`和之前的`tree`进行比较并执行相应操作的过程就是`React`的`diff`。

`React`的`diff`有两个特点：

- 给每个`node`提供一个`key`，如果新`node`的`key`和`old`的`key`相同，则会认为是同一个节点，只需要改变其属性即可；
- 不同类型的组件默认其生成不同的`tree`
  > 在比较`tree`时是根据`root`的类型来执行不同的操作的。

## root 结点类型不同

只要新旧`tree`的根节点的类型不同，`React`会直接干掉这个结点和其子结点重新构建。

- 在干掉旧结点之前会执行 `componentWillUnmount`,然后干掉其`state`并把对应的`DOM`从切面删除
- 新创建的结点对应的`DOM`被插入到页面时，插入前调用 `componentWillMount`，插入后 `componentDidMount`

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

## root 结点类型相同

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

- `key`不稳定时会造成对结点许多不必要的修改（使用频繁排序数组的索引）
- 结点类型不同时，即使子节点很多都可以复用`React`还是会干掉整个结点重新构建

# 深入 React diff 的具体过程

这部分在 `react-reconciler`

current 不为 null 即为 update 的过程，可以看到是为了得到新的 child：

```js
const mountChildFibers = ChildReconciler(false);
const reconcileChildFibers = ChildReconciler(true);

function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    );
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    );
  }
}
```

## case 0: newChild 只是一个单独的元素

流程就是在 current.child 中查找到 key 和 elementType 都与 newChild 相同的 fiber 然后复用上次的 fiber, 其余的元素都标记删除掉。

> 如果更新前后的 child 都是 Fragment 的话，会直接复用之前一次的 children

```js
function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      return;
    }
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }

  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function reconcileSingleElement(
    returnFiber,
    currentFirstChild,
    element,
    lanes
  ) {
    let child = currentFirstChild;
    const key = element.key;
    while (child !== null) {
      if (child.key === key) {
        const elementType = child.elementType;
        if (elementType === REACT_FRAGMENT_TYPE) {
          if (child.tag === Fragment) {
            // 可以看到 Fragment 和正常元素的区别就是
            deleteRemainingChildren(returnFiber, child.sibling);
            const existing = useFiber(child, element.props.children);
            existing.return = returnFiber;
            return existing;
          }
        } else {
          if (elementType === element.elementType) {
            // key 和 elementType 都相同
            // 省略了是 Fragment 的case
            deleteRemainingChildren(returnFiber, child.sibling);

            const existing = useFiber(child, element.props);
            existing.ref = coerceRef(returnFiber, child, element);
            existing.return = returnFiber;
            return existing;
          } else {
            // key 相同但是 elementType 不同
            // 已经没有复用的可能了，直接将剩下的所有元素都标记为删除
            deleteRemainingChildren(returnFiber, child);
            break;
          }
        }
      } else {
        // key 不同的 child 直接干掉，继续查找下一个
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
  }

  function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChildren,
    lanes
  ) {
    // ...
    return placeSingleChild(
      reconcileSingleElement(returnFiber, currentFirstChild, newChildren, lanes)
    );
    // ...
  }

  return reconcileChildFibers;
}
```

## case 1: newChild 为多元素

多元素的流程肯定是较为复杂的，因为 React 发现在组件中存在多个 children 的更新时，增删相较于更新要少，所以读多个元素的 diff 首先是为更新服务的。

流程：

diff 会有 2 轮

- 第一轮：

  - 按照索引从 0 向后进行遍历
  - 直到 `newChild` 遍历完成(`newIdx < newChild.length`) || `prevChild` 遍历完成(`oldFiber !== null`)

- 如果 `newChild` 和 `prevChild` 都已经遍历完成; return;
- 如果 `newChild` 结束，但 `prevChild` 未结束，说明新的比原来的少，将 `oldFiber.sibling` 标记为 deletion; return;
- 如果 `prevChild` 结束，但 `newChild` 未结束，说明新的比原来的多，则对 `newChild[newIdx:]` 执行创建工作; return;

否则将进入第二轮的 diff：

- 新的元素如果在 existingChildren 中 (`Map<oldFiber.index, oldFiber>`), 则复用
- 如果 `oldFiber.index < lastPlaceIndex` 则标记其应该向右移动
  > lastPlaceIndex 其实就是已经被复用了的所以 oldFibers 在新的 children 中的最后的那个索引。

```js
function ChildReconciler(returnFiber, currentFirstChild, newChild, lanes) {
  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number
  ): number {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }
    const current = newFiber.alternate;
    if (current !== null) {
      const oldIndex = current.index;
      if (oldIndex < lastPlacedIndex) {
        // current 和 最后一个被复用的fiber
        // 前后两次的相对位置改变。
        // 因此，即使当前的fiber被重用，但是需要再次被Placement
        // 即 在映射到DOM时，需要将对应的DOM append一下  也就是向右移动
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      } else {
        // 相对于最后一个被复用的fiber
        // 相对位置没有变，所以current成了最后一个被复用的fiber
        // 那lastPlacedIndex = current.index

        // 而且这里没有设置flags
        // 说明当前的fiber 不需要执行Placement,Update, Deletion, PlacementAndUpdate等操作）
        // 真实的DOM不需要改变，达到复用的目的
        return oldIndex;
      }
    } else {
      // 全新的 child 直接插入append就行了
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    }
  }
  function reconcileChildrenArray(
    returnFiber,
    currentFirstChild,
    newChildren,
    lanes
  ) {
    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        // 新的已经遍历完了
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes
      );
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
      // 新的遍历完了，对原来多出的标记deletion
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // 旧的遍历完了， 对新增多出来的执行创建操作
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
        if (newFiber === null) {
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    // 把剩下的oldFiber做成一个 Map<oldFiber.key, oldFiber>
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes
      );
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            // newFiber.alternate 存在，说明 newFiber 是被重用的
            // 需要将 newFiber 从 existingChildren 中移出
            // 因为 existingChildren 在下面是要删掉的（existingChildren 都是不会再被用到的fibers）
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key
            );
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
  }

  function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChildren,
    lanes
  ) {
    // ...
    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      );
    }
    // ...
  }

  return reconcileChildFibers;
}
```

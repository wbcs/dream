# ReactDOM.render
在源码中，这部分使用的好像是ts，或者是用了某些扩展的js。我这里写下我自己认为同等功能的js代码方便理解，如有错误请指出。

```javascript
// 这里只写render，其他的如果有必要在后续文章中应该会提到

/** 
 * element,一个合法的React元素
 * container是一个DOM Container
 */
const ReactDOM = {
  render(element, container, callback) {
    // 直接将子元素element渲染到container中
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    );
  },
}；


function legacyRenderSubtreeIntoContainer(
  parentComponent, // null
  children, // subtree
  container, // container
  forceHydrate, // false
  callback,
) {
  // 如果不是合法的container，则报错，省略具体代码
  let root = container._reactRootContainer;

  // 如果root为空，则说明是第一次调用ReactDOM.render, 也就是说container是原生的DOM。不是React元素
  // 否则说明已经将DOM插入的文档中，只用做更新即可
  if (!root) {
    // 搞个root
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);

    if (typeof callback === 'function') {
      // 将被插入的组件作为callback的this，并且调用callback。
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  }

  return getPublicRootInstance(root._internalRoot);
}



```

总结一下`ReactDOM.render()`都干了啥：
+ 清空container的内容
+ 将被插入的组件作为callback的this，调用callback
+ 返回被插入的组件
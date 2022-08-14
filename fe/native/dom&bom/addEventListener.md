# 用法

```js
DOM.addEventListener(eventName, cb, options);
```

# 实现

```js
HTMLNode.prototype.addEventListener = function (
  eventName,
  cb,
  options = false
) {
  if (!this._handler) this._handler = {};
  if (!this._handler[eventName]) {
    this._handler[eventName] = {
      bubble: [],
      capture: [],
    };
  }
  this._handler[eventName][options ? 'capture' : 'bubble'].push(cb);
};
```

# 触发

触发的流程：

1.  创建 event 对象，并初始化
2.  计算从当前 DOM 到 HTML 的路径
3.  触发路径中各个元素的 capture 的 cb
4.  触发路径中各个元素的 onXX 的 cb
5.  触发路径中各个元素的 bubble 的 cb
6.  触发浏览器默认行为

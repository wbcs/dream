# 用法
```js
DOM.addEventListener(eventName, cb, options);
```

# 实现
```js
HTMLNode.prototype.addEventListener = function(eventName, cb, options = false) {
  if (!this._handler) this._handler = {}
  if (!this._handler[eventName]) {
    this._handler[eventName] = {
      bubble: [],
      capture: []
    }
  }
  this._handler[eventName][options ? 'capture' : 'bubble'].push(cb)
}
```

# 触发
触发的流程：
1.  创建event对象，并初始化
2.  计算从当前DOM到HTML的路径
3.  触发路径中各个元素的capture的cb
4.  触发路径中各个元素的onXX的cb
5.  触发路径中各个元素的bubble的cb
6.  触发浏览器默认行为

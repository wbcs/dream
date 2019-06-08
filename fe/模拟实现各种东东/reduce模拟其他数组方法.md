# reduce模拟map
```js
// 别忘了map的第二个参数
Array.prototype._map = function(fn, context = window) {
  if (typeof fn !== 'function') {
    throw new TypeError('undefined is not a function');
  }
  return this.reduce((prev, val, index, arr) => {
    return prev.concat(fn.call(context, val, index, arr));
  }, []);
};
```
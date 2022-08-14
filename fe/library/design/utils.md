# 前言

框架设计都需要的一些种子模块，也就是我们所说的 utils。

# 对象扩展

```js
function extend(dest, src) {
  Object.keys(src).forEach((key) => (dest[key] = src[key]));
  return dest;
}
```

因为比较常用，所以 ES6 直接就支持它了。

```js
function toObject(val) {
  if (val === null) {
    throw new Error('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
}
Object.assign =
  Object.assign ||
  function (target) {
    var to = toObject(target);

    for (var i = 1; i < arguments.length; i++) {
      Object.keys(arguments[i]).forEach((key) => {
        to[key] = arguments[i][key];
      });
    }

    return to;
  };
```

# 数组化

```js
function toArray(iterable) {
  return Array.prototype.slice.call(iterable);
}
```

本来这么做已经可以了，但是对于低版本 IE，HTMLCollection、NodeList 不是 Object 的子类，所以直接调用上面的方法会报错。

JQuery 中的 makeArray

```js
var makeArray = function (iterable) {
  var res = [];
  if (iterable === null || iterable === undefined) return res;
  var i = iterable.length;
  if (
    i === undefined ||
    typeof iterable === 'function' ||
    typeof iterable === 'string'
  ) {
    res[0] = iterable;
  } else {
    while (i) {
      res[--i] = iterable[i];
    }
  }
};
```

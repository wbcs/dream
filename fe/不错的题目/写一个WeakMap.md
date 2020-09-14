```js
function isPrimitive(value) {
  const primitiveTypes = ['string', 'number', 'symbol', 'bigint', 'boolean', 'undefined', 'null']
  const type = typeof value
  if (primitiveTypes.includes(type)) {
    return true
  }
  return value === null
}

class _WeakMap {
  constructor() {
    this._key = Symbol('weak-map')
  }
  get(key) {
    return key[this._key]
  }
  set(key, value) {
    if (isPrimitive(key)) {
      throw new Error('Invalid value used as weak map key')
    }
    Object.defineProperty(key, this._key, {
      configurable: true,
      enumerable: false,
      get() {
        return value
      }
    })
  }
}
```

思路就是在 `key` 上添加一个不可枚举的内部属性，它的值就是对应的 `value` 。这样当 `_WeakMap` 本身不引用 `key` ，也就不会阻止 `key` 被 `GC`。

所以 `WeakMap` 的 `key` 不能是 `primitive`。
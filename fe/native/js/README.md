### Iterator

- `Iterator` 迭代器，只能进行一次迭代
- `Iterable` 可迭代对象，一组集合可以重复迭代

`XXX.prototype.keys/values/entries` 和 `String.prototype.matchAll` 返回 迭代器

> 除 `Object.prototype`

默认使用迭代器的场景：

- 解构赋值
- 扩展运算符
- `yield *`
- `for of`
- `Array.from()`
- `Map()`, `Set()`, `WeakMap()`, `WeakSet()`（比如 `new Map([['a', 1], ['b', 2]])`）
- `Promise.all()`, `Promise.race()`

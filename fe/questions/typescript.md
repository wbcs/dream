1. `typescript`的`interface`编译后还会占用空间吗？`enum`呢？
   `interface`不会占用空间，但是`enum`会。

```ts
enum Letter {
  A,
  B,
  C,
}
// 会被编译为
var Letter;
(function (Letter) {
  Letter[(Letter['A'] = 0)] = 'A';
  Letter[(Letter['B'] = 1)] = 'B';
  Letter[(Letter['C'] = 2)] = 'C';
})(Letter || (Letter = {}));
```

> 也就是一个对象，对象的`ABC`属性分别为`012`, `012`属性分别为`ABC`

2.

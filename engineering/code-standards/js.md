只写新学到的，日常遵循的不管

- 不能出现未经定义的常量

```js
// bad
if (sex === '1') {
}
// good
const MAN = '1';
const WOMAN = '2';
if (sex === MAN) {
}
```

> 如果不遵循，那要么写注释（很乱），要么等着被干吧

- 使用 class、extends 语法来实现 OOP

```js
// bad
function Super() {}
function Sub() {}
Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
// good
class Super {}
class Sub extends Super {}
```

> 很多 OOP 都是从 java 那里学来的，因为 js 的原因，造成了各种 prototype 的操蛋写法。

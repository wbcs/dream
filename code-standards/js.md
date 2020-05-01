只写新学到的，日常遵循的不管

+ 不能出现未经定义的常量
```js
// bad
if (sex === '1') {
}
// good
const MAN = '1'
const WOMAN = '2'
if (sex === MAN) {

}
```
> 如果不遵循，那要么写注释（很乱），要么等着被干吧

+ 使用 class、extends 语法来实现OOP
```js
// bad
function Super() {}
function Sub() {}
Sub.prototype = new Super()
Sub.prototype.constructor = Sub
// good
class Super {
}
class Sub extends Super {
}
```
> 很多OOP都是从java那里学来的，因为js的原因，造成了各种prototype的操蛋写法。
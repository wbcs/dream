# typescript 基本类型
- number
- string
- boolean
- null
- undefined
- symbol
- bigint
- object
- unknown
- any
- void
- never
- Enum
- Array
- Tuple


# typescript比JavaScript多了什么？
+ 为 `JavaScript` 添加了类型
+ 提供未来版本的语法到当前js引擎的功能

# 强类型、弱类型
+ 强类型、弱类型：类型转换是否需要显示区分。
  + 前者需要显示声明，比如 `C/C++` 中 `int doubleToInt = (int)doubleNumber;` 
  + 后者则是隐含的，不需要显示声明，比如 `JavaScript` 中 `const num = str;`
+ 静态类型、动态类型：类型检查的时机不同。
  + 前者在编译阶段完成，真正 `runtime` 的时候是不需要进行的；
  + 后者则是在 `runtime` 的过程中不断去检查，会造成一定 `runtime` 性能损耗，这也是动态语言的通病。

`typescript`对`JavaScript`的类型检查是静态的，也就是说真正 `runtime` 的时候引擎依然是需要动态检查类型的，对于code的 `runtime` 效率而言没有任何提高。


# 为什么要使用typescript？
那为什么还要使用ts呢？它的意义何在？答案是静态类型更加有利于构建大型project。

静态类型又可以称为 `early fail` 。一旦code被键入，就能够在执行之前发现一些潜在的错误，比如不能读取string特有方法等等。这对于大型项目调试困难是很有帮助的，能够很快的发现潜在的威胁在哪里。因为人很难发现某些特殊情况下，自己写的这段代码并不适用，而静态类型检查能够很好的解决这个问题。这是 `typescript` 最大的价值。

其次，阅读代码的时候，一看就知道某个obj里有哪些key，对于数据结构的展示非常清晰。非常方便维护。

在一个对于代码编辑器的提示也有很大提升，很多情况下都不需要去查阅文档，编辑器就会把对应的属性、API显示出来，灰常方便。

# tips
## interface
+ 对象字面的额外属性检查：
```ts
interface ITest {
  age: number
}
function fn(arg: ITest) {
  // ,,,,
}
fn({
  age: 1,
  name: 'wb'  // 报错
})
const obj = {
  age: 1,
  name: 'wb'
}
fn(obj) // okay
```
> 为了防止拼写错误，ts会对对象字面量特殊对待，会经过除interface外的额外属性检查。

+ Record：
```ts
interface ITest {
  [key: string]: string
  [key: number]: number // 出错
}
```
> JavaScript的number索引会被转换成string，所以number的返回值必须是string返回值的子集才行。

+ implements: implements一个interface的时候，ts只会对class的实力部分检测。
```ts
interface Test {
  age: number
  getAge: () => number
}
class Person implements Test {
  age: number
  constructor() {}
  getAge() {
    return this.age // error
  }
}
```
+ namespace:
当namespace和class、function、enum重名时，可以认为namespace中导出的成员直接加在class、function、enum中
```ts
function fn() {}
fn.abc // undefined
namespace fn {
  export const abc = 123
}
fn.abc // 123
```

- 重载，实现part签名对外不可见
- 
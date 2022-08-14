# tips

## 一些小技巧

- string => UnionOfLetter

```ts
const string = 'wbcs';

// 23 最多递归层貌似
type CharUnion<S extends string> = S extends `${infer AlphaLetter}${infer Rest}`
  ? AlphaLetter | CharUnion<Rest>
  : never;

// type Letter = "w" | "b" | "c" | "s"
type Letter = CharUnion<typeof string>;
```

## interface

- 对象字面的额外属性检查：

```ts
interface ITest {
  age: number;
}
function fn(arg: ITest) {
  // ,,,,
}
fn({
  age: 1,
  name: 'wb', // 报错
});
const obj = {
  age: 1,
  name: 'wb',
};
fn(obj); // okay
```

> 为了防止拼写错误，ts 会对对象字面量特殊对待，会经过除 interface 外的额外属性检查。

- Record：

```ts
interface ITest {
  [key: string]: string;
  [key: number]: number; // 出错
}
```

> JavaScript 的 number 索引会被转换成 string，所以 number 的返回值必须是 string 返回值的子集才行。

- implements: implements 一个 interface 的时候，ts 只会对 class 的实力部分检测。

```ts
interface Test {
  age: number;
  getAge: () => number;
}
class Person implements Test {
  age: number;
  constructor() {}
  getAge() {
    return this.age; // error
  }
}
```

- namespace:
  当 namespace 和 class、function、enum 重名时，可以认为 namespace 中导出的成员直接加在 class、function、enum 中

```ts
function fn() {}
fn.abc; // undefined
namespace fn {
  export const abc = 123;
}
fn.abc; // 123
```

- 显式地写出需要的 types： `compilerOptions.types: ["react"]`

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

# typescript 比 JavaScript 多了什么？

- 为 `JavaScript` 添加了类型
- 提供未来版本的语法到当前 js 引擎的功能

# 强类型、弱类型

- 强类型、弱类型：类型转换是否需要显示区分。
  - 前者需要显示声明，比如 `C/C++` 中 `int doubleToInt = (int)doubleNumber;`
  - 后者则是隐含的，不需要显示声明，比如 `JavaScript` 中 `const num = str;`
- 静态类型、动态类型：类型检查的时机不同。
  - 前者在编译阶段完成，真正 `runtime` 的时候是不需要进行的；
  - 后者则是在 `runtime` 的过程中不断去检查，会造成一定 `runtime` 性能损耗，这也是动态语言的通病。

`typescript`对`JavaScript`的类型检查是静态的，也就是说真正 `runtime` 的时候引擎依然是需要动态检查类型的，对于 code 的 `runtime` 效率而言没有任何提高。

- 为什么要使用 typescript？
  - 编译时检查类型错误，即 early fail
  - IDE 自动提醒
  - 类型即注释，更方便维护

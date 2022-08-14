# 概述

一些简单的区别直接说完就不多 BB 了：

## let、const 和 var 声明次数的区别

`let、const`只能声明**一次**，而`var`可以**多次**声明。

```javascript
// 没有一点问题
var a;
var a;

// Uncaught SyntaxError: Identifier 'b' has already been declared
let b;
let b;

// Uncaught SyntaxError: Identifier 'c' has already been declared
const c = 0;
const c = 0;
```

可以看到在声明 c 的时候我有意进行了初始化，因为 const 和 let、var 的另一个不同之处在于，const 声明的常量必须进行初始化，否则会报错。

```javascript
// Uncaught SyntaxError: Missing initializer in const declaration
const d;
```

## let、const 和 var 作用域的区别

var 在声明之前可以被访问，值为 undefined。var 没有块级作用域。

let、const 在声明之前访问会报错（包括 typeof），这就是所谓的临时死区 TDZ，并且他们都有块级作用域。

```javascript
console.log(i); // undefined
if (true) {
  console.log(i); // undefined
  var i = 0;
}
console.log(i); // 0

// const也是一样的
console.log(i); // undefined
if (true) {
  console.log(i); // Uncaught ReferenceError: i is not defined
  const i = 0;
}
console.log(i); // undefined
```

`let、const`的`TDZ`只在*其所在的块级作用域内*才会生效。

## 在全局声明的区别

在全局作用域中用`var`来声明，该变量会成为`window`的属性，即使`window`上已经存在原生属性，也会被`var`给覆盖掉。

而`let、const`在全局声明时则不会替换掉`window`上的属性。

那么去哪了？

![](https://user-gold-cdn.xitu.io/2018/11/28/1675884d28f3726f?w=233&h=215&f=png&s=8585)

如`chrome`所示，`var`声明的全局变量都到`Global(window)`中去了，而`let、const`声明的全局变量(严格意义上讲不是全局变量)都在一个名为`Script`的作用域中。

## let、const 和 var 在循环中的区别

```javascript
// 在for之外能访问i什么的就不说了，跟上一点一样
var fn = [];
for (var i = 0; i < 10; i++) {
  fn[i] = function () {
    console.log(i);
  };
}
fn; // 10个函数都会打印10，闭包问题不再赘述，自己去学

var fn = [];
for (let i = 0; i < 10; i++) {
  fn[i] = function () {
    console.log(i);
  };
}
fn; // 会打印1~10
```

可以看到，用`let/const`声明的计数器不会受闭包的影响。

是因为用`let/const`声明的变量在每次循环都会重新声明一个新的变量，并用之前的值去初始化。

> 因为 for 的每次循环都是一个新的作用域，只不过初始化用的是之前的值

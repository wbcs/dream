# JavaScript 进阶系列之 function 篇

每天都在 codeing，但是如果没有总结的话，根本记不住。以后定期写文章，不管有没有人看都会有一定的收获。

## 目录：

- [函数的参数](#函数的参数)
- [箭头函数](#箭头函数)
- [函数的 name 属性](#函数的name属性)
- [函数节流、函数防抖](#函数节流、函数防抖)
- [尾递归](#尾递归)
- [深入点不知道的](#深入点不知道的)
- [一些值得注意的点](#一些值得注意的点)

我的[GitHub](https://github.com/wbcs/dream/blob/master/fe/js/function.md)，欢迎 star

# 函数的参数

## 默认参数

使用了默认参数的函数，会自动启用 ES6

```js
function fn(a, b = 1) {}
fn(1);
```

**不传或者手动传递 undefined**都会使用默认的参数。

除此之外，和正常的`ES5`还有一些区别：

- 形参列表里的参数，都相当于使用`let`声明的一样(意味着存在`TDZ`)
- 默认参数可以是形参列表里的变量，但不可以是函数体内的变量哦。
- 使用了默认参数，说明当前使用的`ES6`，所以当前`scope`都是处于`strict`模式下的。

> 形参列表里的参数的`scope`和函数体内的`scope`是两个`scope`（书上是这么说的，但是他妈的如果是两个`scope`，那我重新用`let`声明为什么还报错？干！所以我觉得应该只是说形参列表的默认参数不能使用函数作用域内部的变量，但还是属于`同一个scope`，因为类似的`for`循环，括号里和花括号里是两个`scope`我就能用`let`重复声明）

## 默认参数对 arguments 的影响

记住一点，严格模式下`arguments`只和传入的实参一样，而且不保证同步。

所以一旦使用了默认参数，就说明要么是没传，要么是传了`undefined`。那`arguments`里就肯定没有默认参数了。

```js
function fn(a, b = 1) {
  console.log(arguments[0] === a); // true
  console.log(arguments[1] === b); // false
}
fn(1);
```

## 无名参数

```js
function fn(a, ...args) {}
```

使用限制：

- 不定参数只能在参数列表的最后
- 不定参数不能用在`setter`中，因为`setter`的参数只能有一个`value`，在不定参数的定义中是可以有无限多。这两者在当前上下文中不允许

一些注意的点：

- `arguments`中只存储传入的参数
- `fn.length`则是命名参数的个数，也就是说`fn`的`length`属性是不包括`args`中的东东的

> 其实在`ES4`的草案中，`arguments`对象是会被不定参数给干掉的，不过`ES4`搁置以后，等到`ES6`出来，它很`ES4`的区别是保留了`arguments`对象

## arguments

在非严格模式下，`arguments`对象和**实参**保持同步:

```js
function fn(a, b) {
  console.log(a === arguments[0]);
  a = 'hehe';
  console.log(a === arguments[1]);
}
fn(1, 2);
```

> 结果都是 true

之所以给实参加粗，是因为即使保持同步，也只是和传入的参数保持一致，比如我如果没有传入`b`，然后我修改了`b`，这个时候`arguments[0]`和`b`是不一致的。

但是在严格模式下，`arguments`和参数则不会保持同步。

# 箭头函数

与普通函数的区别：

- 没有`new.target、this、arguments、super`，这些东西都是最近一层非箭头函数的东西.（所以，一旦不存在这样的函数，但是在箭头函数中访问了这些`keyword`就会抛出错误）
- 不能被`new`调用，没有`[[construct]]`内部方法
- 没有`prototype`属性
- this 遵循词法作用域，运行过程中不会改变
- 无论是否为严格模式，都不能有同名的参数
- 因为没有`arguments`，所以参数只能通过命名参数和不定参数来访问
- 不能使用`yield`关键字，所以也就不能当做`generator`函数咯
  > 注意，能否被用作`constructor`和其有无`prototype`属性无关

就算用`call、apply、bind`这样的方法，也没法改变箭头函数的`this`。不过通过`bind`可以传递参数倒是真的

# 函数的 name 属性

`name`属性是为了更好地辨别函数：

```js
function fn() {} // fn
const a = function () {}; // a
const b = fn; // fn
const c = a; // a
const d = function hehe() {}; // hehe
```

注释就是对应函数的`name`。仔细观察很容易发现，如果函数是使用函数声明创建的，那`name`就是`function`关键字后的 string。如果是使用赋值语句创建的，那`name`就是对应的变量名。而且一旦`function.name`确定下来，后续赋值给其他变量也不会改变。其中`function`声明比赋值语句的优先级高。

特殊情况：

```js
const obj = {
  get name() {},
  hehe() {},
};
console.log(obj.name); // 书上说是 get name，但是我亲测是undefined啊
console.log(obj.hehe); // hehe
```

另外`bind`出来的函数，`name`带有`bound`前缀；通过`Function`创建的函数带有`anonymous`

> 函数的`name`属性不一定同步于引用变量，只是一个协助调试用的额外信息而已，所以不要使用`name`属性来获取函数的引用

# 函数节流、函数防抖

节流就是等到你不触发了我在执行：

```js
function debounce(fn, time, immediate = false) {
  let clear;
  return function (...args) {
    if (immediate) {
      immediate = false;
      fn(...args);
      return;
    }
    if (clear) {
      clearTimeout(clear);
    }
    clear = setTimeout(() => {
      fn(...args);
      clear = 0;
    }, time);
  };
}
```

防抖就是无论你触发多少次，我只在规定的时间里触发一次

```js
function throttle(fn, time, immediate = false) {
  let clear;
  let prev = 0;
  return function (...args) {
    if (immediate) {
      immediate = false;
      fn(...args);
      return;
    }
    if (!clear && Date.now() - prev >= time) {
      prev = Date.now();
      clear = setTimeout(() => {
        fn(...args);
        clear = 0;
        prev = 0;
      }, time);
    }
  };
}
```

# 尾递归

尾调用就是函数作为另一个函数的最后一条语句被调用。

在`ES5`中，尾调用的实现和普通的函数调用一样，都是创建一个新的`stack frame`，将其`push`到调用栈，来表示函数调用，如果在循环调用中，调用栈的大小过大就会爆栈。

而尾递归优化呢，指的就是不在创建新的`stack frame`，而是清除掉当前的`stack frame`，然后重用即可。这样，尾递归的时候，整个调用栈的大小就不会变了，达到了优化的效果。

以下情况会优化：

- 尾调用不访问当前`stack frame`的变量。也就是说函数不能是一个闭包
- 在函数内部，必须是最后一条语句
- 尾调用的结果作为返回值返回

```js
function fn1() {
  // 其他语句
  return fn2();
}
```

# 深入点不知道的

`JavaScript`函数中有两个内部方法：`[[call]]`和`[[construct]]`。通过`new`来调用函数的时候执行的是`construct`内部方法，而正常调用则执行`call`内部方法。

- 前者负责创建一个实例`instance`，然后执行函数体。当使用`new`调用函数的时候，`new.target`被赋值为 new 操作符的目标，通常就是被 new 调用的构造函数。所以如果需要判断函数是否被 new 调用，则只需要查看`new.target`是否为`undefined`即可
- 后者直接执行代码中的函数体
  > 具有`[[construct]]`内部方法的函数被统称为构造函数。不是所有的函数都是构造函数，所以不是所有的函数都能够被`new`调用（比如箭头函数）。这个具体细节看下文。

## JS 中的三种 Function

`JS`目前具有三种类型的`function object`：

- `ECMAScript Function Object`：所有通过 JS 语言生成的`function object`都是`ECMAScript Function Object`；
- `Built-in Function`：引擎内置的所有`function object`如果没有实现为`ECMAScript Function Object`，必须实现为此处的`Built-in Function Object`；
- `Bound Function`：`Function.prototype.bind`生成的`function object`为<u>Bound Function Object</u>，调用<u>Bound Function Object</u>会导致调用绑定的<u>bound target function</u>；

`ES6`标准指出，函数内部都有两个方法：`[[call]] [[construct]] `。前者是普通调用，后者是`new`调用。

而即便都是`new`调用，`built in` 和 普通的 `function object`还是有所差别：

- `new operator`作用于`ECMAScript Function Object`会根据当前`function object`的`prototype`属性生成一个新的对象，并将其作为`this`传入`function object`进行调用；
- `new operator`作用于`Built-in Function Object`的时候不会生成一个新的对象作为`this`传入当前的`function object`，而是由当前的`function object`在`function call`的时候自己生成一个新的对象。

> 经常看到面试题问`new operator`执行了哪些操作，然后就开始巴拉巴拉：根据原型生成一个新的对象，然后将新的对象作为 this 调用函数，最后根据函数的返回值是否为对象来判断应该返回什么。。。（心中千万只草泥马飘过）；当然，如果要用`JS`来模拟`new operator`那只能按照这个流程搞，顶多再用上`new.target`。

## js 中的函数都有 prototype？

以前一直以为所有`js`函数都有`prototype`，直到最近才发现不是。

除非在特定函数的描述中另有指定，否则不是构造函数的内置函数不具有原型属性。

也就是说，`js`的一些内置函数本来就没打算用作`constructor`，也就没有添加`[[construct]] internal-method`。但是反过来不一定成立，因为有的构造函数没有`prototype`,但它仍然是一个构造函数，比如：

```js
console.log(Proxy.prototype); // undefined
// 但是可以通过new Proxy(args)来创建对象
```

按照规范，如果一个`function-object` 既具有`prototype`属性，又具有`[[construct]] internal-method`，那么它就是一个`constructor`，此时该`function-object`承担着`creates and initializes objects`的责任；

但`Proxy constructor`为什么没有`prototype`属性呢？虽然`constructor`用于 `creates and initializes objects`，但如果生成的对象的`[[prototype]]`属性不需要`constructor`的`prototype`属性初始化，那么`constructor`的`prototype`就没有存在的必要。

> 也就是说，大部分情况下只要某个`function`有`prototype`属性，同时又具有`[[constructor]]`，那这个`function`就是一个`constructor`。

但是某些特殊情况下也会有例外，即：它不承担创建对象并且初始化。但是由于某些原因它又同时具备了上述条件。

> 这是规范中指出的，目前还没有在`built-in function`中发现过这种特例。不过在`function object`中有两个特例。

## generator function

`generator` 不是 `constructor` ，但是同时具备 `prototype`

## Function.prototype.bind 生成的 Bound function object

通过 `bind` 生成的`bound function` 是没有 `prototype` 属性，不过它仍然可以当作一个 `constructor`。

## 总结

综上所述，明确了以下几点：

- 不是所有函数都是构造函数，必须有内部方法`[[construct]]`
- 不是所有函数都有`prototype`属性
- 有无`prototype`属性和函数是否为构造函数无关，只要有`[[construct]]`属性就是构造函数
- 不是有所的构造函数都能被`new`调用，比如`Symbol`

## 延伸

一个`function object`可以用`new`调用的条件是什么？

也就是说，是否可以用`new`方式调用，和函数是不是构造函数没有关系，有没有`prototype`也没关系，只要函数对象上具有内部的`[[construct]]`，并且函数本身是允许`new`调用的，就可以通过`new`来调用该`function`。

# 一些值得注意的点

- 严格模式下，`function`声明是存在块级作用域的。不过在当前的`scope`中不存在`TDZ`。非严格模式下则不存在块级作用域的特性，会直接提升至顶层作用域

```js
if (true) {
  function a() {}
}
console.log(a); // undefined
```

- 方法和函数：在 ES6 之前 js 中的方法就是某个函数作为某个对象的非数据属性，除此之外和函数没有任何区别。但是在 ES6 之后，所有的方法内部都有一个`[[HomeObject]]`属性，对象的方法有，但是普通的函数则没有。一般情况下都不会有什么区别，但是在使用`super`的时候会有区别

```js
const proto = {
  method() {
    return 'this is a method on proto';
  },
};

const obj = Object.setPrototypeOf(
  {
    test() {
      console.log(super.method());
    },
  },
  proto
);
obj.test(); // this is a method on proto

const obj = Object.setPrototypeOf({}, proto);
obj.test = function () {
  super.method(); // 语法错误
};
obj.test();
```

# 最后

我的[GitHub](https://github.com/wbcs/dream/blob/master/fe/js/function.md)，欢迎 star.

发现错误，欢迎在评论里指出 😆。

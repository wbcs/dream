# JS 中的三种 Function

`JS`目前具有三种类型的`function object`：

- `ECMAScript Function Object`：所有通过 JS 语言生成的`function object`都是`ECMAScript Function Object`；
- `Built-in Function`：引擎内置的所有`function object`如果没有实现为`ECMAScript Function Object`，必须实现为此处的`Built-in Function Object`；
- `Bound Function`：`Function.prototype.bind`生成的`function object`为<u>Bound Function Object</u>，调用<u>Bound Function Object</u>会导致调用绑定的<u>bound target function</u>；

与`ECMAScript Function Object`不同，`Built-in Function Object`具有自己的一套`[[call]] [[construct]] internal method`，所以 `new operator`作用于`Built-in Function Object`与作用于`ECMAScript Function Object`是不同的。

`new operator`作用于`ECMAScript Function Object`会根据当前`function object`的`prototype`属性生成一个新的对象，并将其作为`this`传入`function object`进行调用；

但是`new operator`作用于`Built-in Function Object`的时候不会生成一个新的对象作为`this`传入当前的`function object`，而是由当前的`function object`在`function call`的时候自己生成一个新的对象。

> 经常看到面试题问`new operator`执行了哪些操作，然后就开始巴拉巴拉：根据原型生成一个新的对象，然后将新的对象作为 this 调用函数，最后根据函数的返回值是否为对象来判断应该返回什么。。。（心中千万只草泥马飘过）；当然，如果要用`JS`来模拟`new operator`那只能按照这个流程搞，顶多再用上`new.target`。

# js 中的函数都有 prototype？

以前一直以为所有`js`函数都有`prototype`，直到最近才发现不是。

除非在特定函数的描述中另有指定，否则不是构造函数的内置函数不具有原型属性。

也就是说，`js`的一些内置函数本来就没打算用作`constructor`，也就没有添加`[[constructor]] internal-method`。但是反过来不一定成立，因为有的构造函数没有`prototype`,但它仍然是一个构造函数，比如：

```js
console.log(Proxy.prototype); // undefined
// 但是可以通过new Proxy(args)来创建对象
```

按照规范，如果一个`function-object` 既具有`prototype`属性，又具有`[[construct]] internal-method`，那么它就是一个`constructor`，此时该`function-object`承担着`creates and initializes objects`的责任；

但`Proxy constructor`为什么没有`prototype`属性呢？虽然`constructor`用于 `creates and initializes objects`，但如果生成的对象的`[[prototype]]`属性不需要`constructor`的`prototype`属性初始化，那么`constructor`的`prototype`就没有存在的必要。

> 也就是说，大部分情况下只要某个 function 有 prototype 属性，同时又具有`[[constructor]]`，那这个 function 就是一个 constructor。

但是某些特殊情况下也会有例外，即：它不承担创建对象并且初始化。但是由于某些原因它又同时具备了上述条件。

> 这是规范中指出的，目前还没有在`built-in function`中发现过这种特例。不过在`function object`中有两个特例。

## generator function

`generator` 不是 `constructor` ，但是同时具备 `prototype`

## Function.prototype.bind 生成的 Bound function object

以前写过`bind` 的模拟实现，以为对 `bind` 的了解还算全面，但是知道今天才知道，通过 `bind` 生成的`bound function` 是没有 `prototype` 属性，不过它仍然可以当作一个 `constructor`。

# 总结

综上所述，明确了以下几点：

1. 不是只有`constructor`才能通过`new`调用的，例如：`bound function object`；
2. `constructor`不是只能通过`new`来调用（这个大家都知道）；
3. 不是所有的`constructor`都能通过`new`来调用的，比如：`Symbol`。

# 延伸

一个`function object`可以用`new`调用的条件是什么？

也就是说，是否可以用`new`方式调用，和函数是不是构造函数没有关系，有没有`prototype`也没关系，只要函数对象上具有内部的`[[constructor]]`，并且函数本身是允许`new`调用的，就可以通过`new`来调用该`function`。

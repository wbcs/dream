# call
用法：`fn.call(obj, args);`

call都干了啥？
+ `obj`作为`fn`的`this`，然后可以传入参数。
+ 如果是非`function`调用会抛出错误
+ 如果`obj`传入为`null`或者`undefined`会默认转换为`Window`
+ 如果`obj`传入基本类型，会创建基本类型的封装对象
+ 将此函数的返回值返回

```js
Function.prototype._call = function(context, ...args) {
  const key = Symbol('key')
  const fn = this
  if (typeof fn !== 'function') {
    throw new Error('_call must be called on a function')
  }
  // 对于基本类型的context会自动进行装箱
  // 对于空的context会使用全局的this
  context = (context === undefined || context === null) ? globalThis : new Object(context)
  context[key] = fn
  const res = context[key](...args)
  delete context[key]
  return res
}
```

# bind
用法：`newFn = fn.bind(obj, arg0, ..., argn);`

`bind`都干了啥？
+ 首先明确它会返回一个新的函数
+ `obj`绑定为这个函数的`this`
+ 参数可以在`bind`的时候传一部分，在实际调用的时候传递后续参数
+ 如果是非`function`调用会抛出错误
+ 返回的函数可以用作构造函数，并且`new`出来的实例继承了原函数和返回的函数。
+ 如果传入的obj不是对象，会进行装箱操作

```js
Function.prototype._bind = function(context, ...args) {
  const fn = this
  if (typeof fn !== 'function') {
    throw new Error('_bind must be called on a function')
  }
  context = (context === null || context === undefined) ? window : new Object(context)
  // 两者需要进行取舍，如果想要instanceof得到正确的结果，则需要这么写
  bind.prototype = context.prototype
  // 如果想要模拟bind函数返回值没有prototype属性，则需要这么些
  delete bind.prototype
  function bind(...otherArgs) {
    if (new.target === bind) {
      return new fn(...args, ...otherArgs)
    }
    return fn.call(context, ...args, ...otherArgs)
  }
  return bind
}
```
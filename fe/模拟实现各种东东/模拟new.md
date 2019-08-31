# new模拟实现
`new`做的工作：
+ 创建一个新的对象
+ 将这个对象的原型对象指向为构造函数的`prototype`属性
+ 将构造函数内的`this`指向这个新对象
+ 执行构造函数代码
+ 如果构造函数返回了一个基本类型或者没有返回值，则隐式返回这个对象。反之返回原先的非基本类型。

当然这都是ECAM function object的行为，因为通过js去模拟只能这么去写。
> 当一个构造函数没有prototype属性的时候，会以Object.prototye当做对象的原型


```js
function New(constructor, ...args) {
  if (constructor.name.includes('bound ')) {
    // 虽然bound function可以用作构造函数，但是手动模拟没办法指定他的this
    // 因为它的this已经被绑定了，除非new，其他情况没办法改变其this
    throw new Error('bound function上下文已被绑定')
  }
  const obj = Object.create(constructor.prototype || Object.prototype)
  const temp = constructor.call(obj, ...args)
  return (temp && typeof temp === 'object') ? temp : obj
}
```
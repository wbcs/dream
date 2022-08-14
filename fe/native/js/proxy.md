# 用法

```js
const tarObj = new Proxy(
  {},
  {
    // target就是代理后的对象，receiver就是被代理的对象
    get(target, key, receiver) {},
    set(target, key, value, receiver) {},
  }
);
```

> 如果`new Proxy({}, {})`，那么直接落到被代理的对象身上。

## 其他的拦截

大部分的拦截跟上面的差不多：

- get、set 就不说了
- has(target, key): 拦截`key in obj`
- deleteProperty(target, key): 拦截`delete obj.key`
- getOwnPropertyDescriptor(target, key): 拦截`Object.getOwnPropertyDescriptor(obj, key)`
- defineProperty(target, key, descriptor): 拦截`Object.defineProperty(obj, key, descriptor)`
- preventExtensions(target): 拦截`Object.preventExtensions(obj)`,返回 boolean
- constructor(target, args, fn): 拦截`new target()`
- getPrototypeOf(target): 拦截`Object.getPrototypeOf(obj)`
- setPrototypeOf(target, prototype): 拦截`Object.setPrototypeOf(obj, proto)`
- apply(target, obj, args): 拦截`target.apply(obj, ...args)`、`target()`、`target.call()`
- ownKeys(target): 拦截`Object.getOwnPropertyNames()`、`Object.keys()`、`for in`、`Object.getOwnPropertySymbols`, 返回一个 string 数组，不过这些都得等到对象中存在对应的 key 时才行。

> 知道对应的 key 跟参数就大概差不多了

# Proxy.revocable

这个跟 new 差不多，就是返回一个对象，直接看码得了：

```js
const { proxy, revoke } = Proxy.revocable(target, handler);
proxy.a; // undefined
// revoke可以用于取消proxy
revoke();
proxy.a; // 报错
```

# 跟 Object.defineProperty()的区别

- Object.defineProperty()只能对某个 key 进行监测，如果想对每个属性都监测的话就需要遍历，而 Proxy 是直接监测整个对象，不需要遍历
- 前者对数组的监测只能是：`arr[0] = 1`,不能对可以改变原数组的方法进行监测，而 proxy 可以
- proxy 的兼容性目前还没有提上来，并且对应的 polyfill 也不完善，所以 Vue 要等到 3 的时候才使用这个东东

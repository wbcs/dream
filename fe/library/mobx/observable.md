# 用法回顾

```ts
class Store {
  @observable name = 'Bruce';
}
const Store = observable({
  name: 'Bruce',
});
```

其中 decorator 就是在 class 被生命的时候，会调用 observable，传入三个参数：

```ts
// 当然，因为observable可以直接手动调用，所以参数不一定就是class decorator的这几个
function observable(
  prototypeOfClass: any,
  key?: string,
  descriptor?: Descriptor
) {}
```

# 实现

```ts
function createObservable(v: any, arg2?: any, arg3: any) {
  // 第二个参数是string，说明是通过decorator的方式使用的
  if (typeof arguments[1] === 'string') {
    return deepDecorator.appley(null, arguments as any);
  }
  // 已经被监听过了
  if (isObservable(v)) return v;

  // 可以看到对于纯对象、数组、Map、Set的操作是不同的
  const res = isPlainObject(v)
    ? observable.object(v)
    : Array.isArray(v)
      ? observable.array(v)
      : isES6Map(v)
        ? observable.map(v)
        : isES6Set(v)
          ? observable.set(v)
          : v;

  // 返回的对象不是同一个，说明检测成功
  if (res !== v) return res;

  throw new Error('无法直接监测基本类型，可以使用 observable.box()来检测');
}

export const observable = createObservable as any;

Object
  .keys(observableFactories)
  .forEach(key => observable[key] = observableFactories[key];)
```

# observable.object

```ts
interface IObservableFactories {
  object<T = any>(
    props: T,
    decorators?: { [K in keyof T]?: Function },
    optoins?: CreateObservableOptions
  ): T & IObservableObject;
}
const observableFactories: IObservableFactories = {
  object<T = any>(
    props: T,
    decorators?: { [K in keyof T]?: Function },
    optoins?: CreateObservableOptions
  ): T & IObservableObject {
    // 省略边界错误情况

    // 没有传入options会返回一个默认的
    const o = asCreateObservableOptions(options);
    const proxy = createDynamicObservableObject({});
    extendObservableObjectWithProperties(
      proxy,
      props,
      decorators,
      defaultDecorator
    );
    return proxy;
  },
};
const defaultCreateObservableOptions = {
  deep: true,
  name: undefined,
  defaultDecorator: undefined,
  proxy: true,
};
function asCreateObservableOptions(options?: CreateObservableOptions) {
  if (options === null || options === undefined) {
    return defaultCreateObservableOptions;
  }
}
function createDynamicObservableObject(base) {
  const proxy = new Proxy(base, objectProxyTraps);
  base[$mobx].proxy = proxy;
  return proxy;
}
```

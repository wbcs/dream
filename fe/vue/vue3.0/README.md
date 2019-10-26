# reactive
```ts
function createGetter(isReadonly) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) && builtInSymbols.has(key)) {
      return res;
    }
    if (isRef(res)) {
      return res.value;
    }
    track(target, "get" /* GET */, key);
    return isObject(res)
      ? isReadonly
        ? // need to lazy access readonly and reactive here to avoid
          // circular dependency
          readonly(res)
        : reactive(res)
      : res;
  };
}
const mutableHandlers = {
  get: createGetter(false),
  set,
  deleteProperty,
  has,
  ownKeys
};
// target: reactive(target)
// rawToReactive = new WeakMap()  
// reactiveToRaw = new WeakMap()  保存着所有proxy
// mutableHandlers 监听一般对象所用的handler
// mutableCollectionHandlers 监听set、map、weakset、weakmap所用的handler
return createReactiveObject(target, rawToReactive, reactiveToRaw, mutableHandlers, mutableCollectionHandlers);


function createReactiveObject(target, toProxy, toRaw, baseHandlers, collectionHandlers) {
  if (!isObject(target)) {
    return target;
  }
  // target already has corresponding Proxy
  let observed = toProxy.get(target);
  if (observed !== void 0) {
      return observed;
  }
  // target is already a Proxy
  if (toRaw.has(target)) {
      return target;
  }
  // only a whitelist of value types can be observed.
  if (!canObserve(target)) {
      return target;
  }
  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers;
  observed = new Proxy(target, handlers);
  toProxy.set(target, observed);
  toRaw.set(observed, target);
  if (!targetMap.has(target)) {
    targetMap.set(target, new Map());
  }
  return observed;
}
```
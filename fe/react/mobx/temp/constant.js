export const defaultCreateObservableOptions = {
  deep: true,
  name: undefined,
  defaultDecorator: undefined,
  proxy: true
};

export const deepDecorator = createDecoratorForEnhancer(deepEnhancer)
function createDecoratorForEnhancer(enhancer) {
  const decorator = createPropDecorator(true, function (target, propertyName, descriptor, _decoratorTarget) {
      const initialValue = descriptor
          ? descriptor.initializer
              ? descriptor.initializer.call(target)
              : descriptor.value
          : undefined;
      asObservableObject(target).addObservableProp(propertyName, initialValue, enhancer);
  });
  const res = decorator;
  res.enhancer = enhancer;
  return res;
}
function deepEnhancer(v, _, name) {
  // it is an observable already, done
  if (isObservable(v))
      return v;
  // something that can be converted and mutated?
  if (Array.isArray(v))
      return observable.array(v, { name: name });
  if (isPlainObject(v))
      return observable.object(v, undefined, { name: name });
  if (isES6Map(v))
      return observable.map(v, { name: name });
  if (isES6Set(v))
      return observable.set(v, { name: name });
  return v;
}
function createPropDecorator(propertyInitiallyEnumerable, propertyCreator) {
  return function decoratorFactory() {
      var decoratorArguments;
      var decorator = function decorate(target, prop, descriptor, applyImmediately
      ) {
          if (applyImmediately === true) {
              propertyCreator(target, prop, descriptor, target, decoratorArguments);
              return null;
          }
          if (process.env.NODE_ENV !== "production" && !quacksLikeADecorator(arguments))
              fail("This function is a decorator, but it wasn't invoked like a decorator");
          if (!Object.prototype.hasOwnProperty.call(target, mobxPendingDecorators)) {
              var inheritedDecorators = target[mobxPendingDecorators];
              addHiddenProp(target, mobxPendingDecorators, __assign({}, inheritedDecorators));
          }
          target[mobxPendingDecorators][prop] = {
              prop: prop,
              propertyCreator: propertyCreator,
              descriptor: descriptor,
              decoratorTarget: target,
              decoratorArguments: decoratorArguments
          };
          return createPropertyInitializerDescriptor(prop, propertyInitiallyEnumerable);
      };
      if (quacksLikeADecorator(arguments)) {
          // @decorator
          decoratorArguments = EMPTY_ARRAY;
          return decorator.apply(null, arguments);
      }
      else {
          // @decorator(args)
          decoratorArguments = Array.prototype.slice.call(arguments);
          return decorator;
      }
  };
}
export const mobxDidRunLazyInitializersSymbol = Symbol("mobx did run lazy initializers");
export const mobxPendingDecorators = Symbol("mobx pending decorators");

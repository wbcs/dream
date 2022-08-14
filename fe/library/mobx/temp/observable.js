import { defaultCreateObservableOptions, deepDecorator } from './constant';

export const observableFactories = {
  object(obj) {
    // 就是默认的options
    const createObservableOptions = asCreateObservableOptions();
    // 这里会返回一个函数
    const defaultDecorator = getDefaultDecoratorFromObjectOptions(
      createObservableOptions
    );

    const base = extendObservable({}, undefined, undefined, o);
    const proxy = createDynamicObservableObject(base);
    extendObservableObjectWithProperties(
      proxy,
      props,
      decorators,
      defaultDecorator
    );
    return proxy;
  },
};

function asCreateObservableOptions(thing) {
  if (thing === undefined || thing === null) {
    return defaultCreateObservableOptions;
  }
  return thing;
}
function getDefaultDecoratorFromObjectOptions(options) {
  // 默认是deepDecorator
  return (
    options.defaultDecorator ||
    (options.deep === false ? refDecorator : deepDecorator)
  );
}
function extendObservable(target, properties, decorators, options) {
  // 和object里面的是一样的，因为options都是default的
  const defaultDecorator = getDefaultDecoratorFromObjectOptions(options);
  // 这没屌用，完了还是{}
  initializeInstance(target); // Fixes #1740
  asObservableObject(target, options.name, defaultDecorator.enhancer); // make sure object is observable, even without initial props
  if (properties)
    extendObservableObjectWithProperties(
      target,
      properties,
      decorators,
      defaultDecorator
    );
  return target;
}
function initializeInstance(target) {
  if (target[mobxDidRunLazyInitializersSymbol] === true) return;
  const decorators = target[mobxPendingDecorators];
  if (decorators) {
    addHiddenProp(target, mobxDidRunLazyInitializersSymbol, true);
    for (var key in decorators) {
      var d = decorators[key];
      d.propertyCreator(
        target,
        d.prop,
        d.descriptor,
        d.decoratorTarget,
        d.decoratorArguments
      );
    }
  }
}
function asObservableObject(target, name, defaultEnhancer) {
  if (name === undefined) {
    name = '';
  }
  if (defaultEnhancer === undefined) {
    defaultEnhancer = deepEnhancer;
  }
  if (target.hasOwnProperty($mobx)) {
    return target[$mobx];
  }
  if (!name) {
    name = 'ObservableObject@' + getNextId();
  }
  const adm = new ObservableObjectAdministration(
    target,
    new Map(),
    stringifyKey(name),
    defaultEnhancer
  );
  addHiddenProp(target, $mobx, adm);
  return adm;
}

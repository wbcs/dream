/**
 * 两种用法
 * const observableData = observable({})
 * class {
 *  @observable property = ''
 * }
 */
import { observableFactories } from './observable'


const observable = createObservable

function createObservable(valueOrPrototye, key, descriptor) {
  if (typeof key === 'string') {
    deepDecorator([...arguments])
    return
  }
  if (isObservable(valueOrPrototype)) {
    return valueOrPrototye
  }

  const res = isPlainObject(valueOrPrototye)
    ? observable.object(valueOrPrototye)
    : isArray(valueOrPrototye)
      ? observable.array(valueOrPrototye)
      : isES6Map(valueOrPrototye)
        ? observable.map(valueOrPrototye)
        : isES6Set(valueOrPrototye)
          ? observable.set(valueOrPrototye)
          : valueOrPrototye

  if (res !== valueOrPrototye) {
    return res
  }

  throw new Error('基本类型不能直接被观测，请使用observable.value')
}

Object
  .keys(observableFactories)
  .forEach(key => {
    observable[key] = observableFactories[key]
  })

export {
  observable
}
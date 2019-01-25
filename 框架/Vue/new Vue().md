# 前言
其实这个new Vue(),应该第一个写的。一直拖到现在、、

# 怎么从头开始看源码
任何一个项目都因该有入口文件，只要知道对应的入口文件，就可以阅读了。

打开`package.json`
```json
{
  "scripts": {
    "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev",
  }
}
```
可以发现`npm run dev`的时候跑的是`scripts/config.js`文件。然后打开，别忘了后面的参数`web-full-dev`,发现了它：
```javascript
{
    'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
}
```

好的，找到了入口文件：`web/entry-runtime-with-compiler.js`。如果不知道一些目录在哪里，可以看和`config.js`同目录下的`alias.js`文件，找到对应的目录即可。


# 在new Vue(),之前Vue是个啥
## entry-runtime-with-compiler.js
打开入口文件，可以发现这个文件干了一件事：给`Vue.prototype`上添加了一个`$mount`函数。这个函数就是：
```javascript
const vm = new Vue(options);
vm.$mount('#app');
```
`vm.$mount`方法。
> 具体方法体不细说，回头说
## ./runtime/index
在上面的文件可以看到`import Vue from './runtime/index'`，`Vue`的出生地不在这里，打开这个文件：
```javascript
/* @flow */

import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser, isChrome } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
import platformComponents from './components/index'

// 下载平台对应的工具，因为Vue不仅仅可以运行在web浏览器上
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// 把平台的directive全部merge到Vue.options.directives中，下同
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// 这咋
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      }
    }
  }, 0)
}

export default Vue
```
这里插一句，`Vue.prototype.$mount`,查询Dom的API用的是query：
```javascript
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}
```
> 可以看到，如果`el`获取不到，用一个新的`div`代替，如果`el`不是string，则会`return el`。

## core/index
同样，上面的文件也不是`Vue`的出生文件，继续打开`core/index.js`。
```js
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue
```
> 也是给Vue的原型上添加一些方法，具体不分析。

## ./instance/index
终于到了
```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'

function Vue (options) {
  this._init(options)
}

// 都是给Vue.prototype上添加
initMixin(Vue)  // 添加_init方法
stateMixin(Vue)  // 将 this._data、this._props代理到 this.$data、this.$props，添加$watch、$set、$delete
eventsMixin(Vue) // 添加 $on、$emitt、$once、$off等EventEmitter
lifecycleMixin(Vue) // 添加 _update、 $forceUpdate、 $destroy
renderMixin(Vue)  // 添加$nextTick、_render

export default Vue
```
这个文件干了以下事情：
给`Vue.protytype`上添加了：
+ `_init`方法：`new Vue()`时会执行的一个内部初始化方法。
+ 将`this._data`和`this._props`分别代理到`this.$data、this.$props`
+ 添加`$on、$emitt、$once、$off`等
+ 添加`_update、$forceUpdate、$destroy`
+ 添加`nextTick、_render`

> 其他方法暂时不说，就提一点，将_data、_props代理的原理如下：
```js
const dataDef = {};
const propsDef = {};

dataDef.get = function() {
  return this._data;
};
propsDef.get = function() {
  return this._props;
};

Object.definePropperty(Vue.prototype, '$data', dataDef);
Object.definePropperty(Vue.prototype, '$props', propsDef);
```
在`Vue`被调用之前，它的内容就是上面这么多。接下来看看我们调用`Vue`构造函数的时候都发生了什么。

# new Vue();
```js
function Vue (options) {
  this._init(options)
}
```
所以在`new Vue()`的时候会执行实例的`_init`方法。我们来看看`_init`是个啥，这个方法是`initMixin(Vue)`的时候添加到`Vue.prototype`上的：
```js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    
    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      /** 
       * 这里会把Vue原有的一些资源或者是通过Vue.extend创造的构造函数所有的一些资源合并到实例的$options中
       * 比如一些directions: v-show、v-model就是在这合并到实例中的
       * 
       * 这个函数的合并准则大致为：
       * watch、资源、生命周期函数合并都会保存起来
       * 其他props、computed、methods、inject都会以子组件为准
       * data，相当于Object.assign({}, parentVal, childVal)
      */
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),  // vm的构造函数，有可能不是Vue，是通过Vue.extend生成的其它函数
        options || {},  // 这儿的options，就是 new Vue(options)传递的options
        vm
      )
    }
    /* istanbul ignore else */
      vm._renderProxy = vm
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  };
}
```
> 接下来挨个来看具体的函数，本文主要讲的是new Vue(),所以组件情况、以及Vue.extend等不会详细讲

## initInternalComponent(vm, options)
这个函数在options被判断为是一个组件的时候被执行。
```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // Vue.options,不过也不一定，因为还可以通过Vue.extend来生成一个构造函数
  let options = Ctor.options
  if (Ctor.super) { // 如果super不为undefined，则说明构造函数并非Vue
    // 很显然，new Vue()是不会进入到这的
  }
  return options
}
```
> 所以说这个函数就干了一件事： `return vm.constructor.options`。

## mergeOptions(vm.constructor.options, options || {}, vm)
```js
export function mergeOptions (
  parent: Object, // Vue.options
  child: Object,  // options
  vm?: Component  // vm
): Object {
  if (process.env.NODE_ENV !== 'production') {
    // 对组件的名称进行检测，必须以字母开头-分隔、不能与原生html同名
    checkComponents(child)
  }

  if (typeof child === 'function') {  // 如果options是函数，就取options的options，所以传给Vue的参数可以是个函数
    child = child.options
  }

  normalizeProps(child, vm) // 规范props为对象，key为驼峰形式
  normalizeInject(child, vm)  // 规范inject为对象，key为驼峰
  normalizeDirectives(child)  // 一样，将directive统一为对象形式，如果是函数，则这个函数将作为那个指令的bind和update
  
  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) { // 如果传进来的options本身就是一个经过mergeOptions的对象
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    // strats是当前文件的一个全局对象，里面的key是对应的data、props等属性名，值为函数，这些函数就是对应的合并策略
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```
> 看完这个又有新发现，`new Vue()`的参数可以是函数，实际取的是函数的`options`选项。

### 看看strats
刚刚在注释里说了，里面是对应属性的合并策略，我们来看看：
#### data的合并策略
```js
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {  // 没有vm说明是组件，这个时候data必须是一个function
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}

export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

/**
 * 把from中的属性，合并到to中，
 * 如果to本来就有某个非对象属性，则以to为准
 * 如果to中本来就有某个对象属性，并且from也是对象属性，则递归合并
 * 其他情况啥都不做
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if ( // 两个不是同一对象，并且都是对象时，递归合并
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}
```
> 需要注意的一点是，`data`的合并策略相当于是`() => mergeDataOrFn(parentVal, childVal, vm)`，当执行这个`strats[data]`之后，`data`也并没有被`merge`，只是得到了真正的合并策略，这和下面的`props`等不同，因为`data`要保证在合并的时候`props、computed`等都已经合并`ok`、可以用的一个状态。<br>看了代码可以看出data最终的合并策略是子`data优先级高于父级data`,简单理解就是：`Object.assign({}, parent, child)`;

### props、methods、inject、computed
```js
/**
 * childVal会覆盖掉parentVal，直接赋值
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
```

#### watch合并策略
```js
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  // FF有原生的watch，如果传进来的和native一样，说明没有写watch
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
```
> 看注释也看懂了，`watch`的合并策略和生命周期的一样，都是最终合并为一个数组，也就是说，**watch也可以写成数组**。

#### 生命周期合并策略
```js
/**
 * 如果childVal不存在直接是parentVal
 * 否则，将childVal 直接concat到parentVal后面 
 * 如果parentVa不存在的话，。。自己看代码吧
 */
function mergeHook (
  parentVal: ?Array<Function>,  // parentVal肯定是一个函数数组|[]
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

```
> 说人话就是，如果父子中之存在一个，则对应的钩子函数就是只有它所组成的数组，否则就是由他们两个共同组成的一个数组。而且看了代码我们可以发现，**父子生命周期都可以是数组**。

#### 资源和并策略
Vue中，把组件、指令、filter看做是资源。
```js
/**
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 也就是说，Vue的资源merge策略是以childVal为优先的，
 * 注：Vue中的directives、components、filters被看做是资源
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    // 如果childVal不是纯对象会log一个warning
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)  // 直接将childVal中的属性依次赋值到res中，会覆盖掉res原有属性
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

// contants.js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
> 看到这我们知道，资源的合并策略就是：新的属性合并到实例中，原有的属性在这个实例的原型中。所以有一个结论：**父资源会被同名子资源覆盖**。


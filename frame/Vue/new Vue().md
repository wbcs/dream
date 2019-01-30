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
请看[选项的合并](./选项的合并.md);
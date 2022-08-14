# vm.$mount 的用法

当 Vue 实例没有 el 属性的时候，这个 vm 没有挂载到 DOM 中，如果需要延迟挂载，这个时候可以调用 vm.$mount(el)来挂载。这就是这个 API 的用途。

一般情况：

```js
const vm = new Vue({
  el: '#app',
  router,
  render: (h) => h(App),
});
```

```js
// 这个时候vm不会挂载到DOM中
const vm = new Vue({
  router,
  render: (h) => h(App),
});
// 通过$mount来挂载。
vm.$mount('#app');
```

`vm.$mount([elementOrSelector]);`

- 参数：

# $mount

我们直接调用的`$mount`方法是：

```js
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    // 不允许在body、html上挂载
    return this;
  }

  const options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        return this;
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile');
      }

      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end');
        measure(`vue ${this._name} compile`, 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating);
};

export function query(el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    if (!selected) {
      return document.createElement('div');
    }
    return selected;
  } else {
    return el;
  }
}
```

> `$mount`的第一个参数可以是`css的selector`，也可以是`DOM元素`。前者使用`document.querySelector(el)`来选择，后者直接`return`。其中,如果`selector`获取的元素为空时，`query`会`return document.createElement('div')`。

但是实际调用的却是`mount.call();`, 也就是：

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

> OK，逻辑很简单，再看`mountComponent`

```js
export function mountComponent(
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
  }
  callHook(vm, 'beforeMount');

  /* istanbul ignore if */
  let updateComponent = () => {
    vm._update(vm._render(), hydrating);
  };

  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      },
    },
    true
  );
  hydrating = false;

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm;
}
```

> 无非就是调用`beforeMount`然后监听 vm，如果`vm`发生变化，调用一些方法，最后再调用`mounted`生命周期钩子。

# 总结

`$mount`的  参数可以是`css`的`selector`或者`DOM`元素，`Vue`底层采用`document.querySelector()`来获取`DOM`，如果为空创建一个新`div`。

然后调用`beforeMount、mounted`钩子。

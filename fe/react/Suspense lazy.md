# 用法
```js
import { Suspense, lazy } from 'react';
const Component = lazy(() => import('./path/component'));

function App() {
  return <Suspense fallback={'loading ...'}>
    <Component />
  </Suspense>;
}
```
在`Component`还没有下载完毕之前，`Suspense`会返回`fallback`中的组件。

# 引入的原因
如果`React`没有`Suspense`、`lazy`的话，想要达到类似的效果就只能这么写：
```js
function App() {
  const [Component, setComponent] = useState(null);
  useEffect(() => {
    import('./path/component').then(res => {
      setComponent(res.default);
    });
  }, []);
  return <div>
    {Component
      ? <Component />
      : <span>loading...>}
  </div>;
}
```
但是这么做有问题：

如果每个组件内部都有按需加载的子组件，那整个页面很多的区域都会有`loading`，影响用户体验。所以`loading`一般是要加到某整体区域组件上的。

这个时候`loading`就需要放到父组件或者更高层的祖先组件上。那显示`loading`，等待按需加载完成之后撤销`loading`的代码就会很多，因为涉及到按需加载的子组件全部下载over之后 父组件再显示组价 隐藏`loading`。多出许多代码。

因为这些原因，`React`才推出了`Suspenes`跟`lazy`。

`lazy`负责按需加载组件。

而`Suspenes`作为整个存在按需加载的子组件的父组件，在`Suspense`上添加`fallback`设置`loading`就解决了显示`loading`的逻辑部分，简化了很多操作。

# lazy
上面也模拟实现了没有`lazy`按需加载的代码，需要`fetch`、设置`state`，然后条件渲染。

有了`lazy`，直接将按需加载的组件当做普通的组件使用，少了很多代码，而且增强可读性、可维护性。
```js
const Component = lazy(() => import('./path/component/'));
```

**注意**：没有用`Suspense`包裹的`lazy`组件会报错。

> 不过当前的`lazy`还不支持`SSR`。

## import()
规定`import` 必须返回一个会`resolve ESModule`的`Promise`，并且这个`Module`的`default`是一个返回合法的`React Component`。
```js
const component = lazy(() => {
  return new Promise((resolve) => {
    setTimout(() => {
      resolve({
        default() {
          return <div>Component</div>;
        },
      });
    }, 5000);
  });
});
```

# Suspense
> `Suspense`：悬疑.

只要内部还有没有 `resolve` 的组件，就直接返回 `fallback` 的内容。

`React`的新特性，它类似于懒加载，等到需要加载某些组件的时候才去下载相关代码。在没有这个新特性之前都是由第三方库来负责`code-spliting`的。现在`React`把他提升到了框架层面。


# 总结
整体来看，`React`引入`Suspense`和`lazy`还是非常屌的。
+ 防止页面抖动：这个主要是添加`loading`，没有`loading`会突然出来一块内容。
+ 集中`loading`：不会让页面每个section都有`loading`，集中到整个大区域
+ 优雅：不需要再为了`loading`的显示，再保存各个按需加载组件的flag，再通知父组件等一系列冗余但又不得不写的逻辑了。

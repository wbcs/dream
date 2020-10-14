# 前端路由
React:
+ react-router
+ react-router-dom

Vue:
+ vue-router

# React 系
## react-router-dom

+ `<BrowserRouter>`：使用 `createBrowserHistory` 创建 `history` 传递给 `react-router` 的 `<Router>`(`HashRouter`、`MemoryRouter` 同理)
+ `<Link>`：最终渲染的真实元素是 `<a>`, 对 `onClick` 做了一层代理：
  1. 忽略除鼠标左键以外的其他任何click
  2. 组合点击（功能键 + 鼠标）则不做 navigate
  3. 让浏览器处理类似 `<a target="_blank" />`(除 _self)
  除此之外，
+ `<NavLink>`: 使用了 `<Link>` 支持对 active 的导航元素设置样式, 可以理解为定制版的 `<Link>`

+ `<BrowserRouter>`：使用 `createBrowserHistory` 创建 `history` 传递给 `react-router` 的 `<Router>`(`HashRouter`、`MemoryRouter` 同理)
+ `<Link>`：最终渲染的真实元素是 `<a>`, 对 onClick 做了一层代理，以下action会交由浏览器去处理：
  1. 鼠标左键以外的其他任何click
  2. 组合点击（功能键 + 鼠标）
  3. 类似 `<a target="_blank" />`(除 _self)
+ `<NavLink>`: 使用了 `<Link>` 支持对 active 的导航元素设置样式, 可以理解为定制版的 `<Link>`

> 所以用 `<Link>` 和 `<a>` 的区别就在于，前者是调用 history 这个 **库（not native API）** 的 API 来做跳转， 后者是直接依赖浏览器默认行为做的跳转。

## react-router

+ `<Router>`: 整个 React App 都需要处于 `<Route>` 中，因为 `<Route>` 其实是作为一个 `Context.Provider` 给其他的 react-router 组件提供数据
+ `<Switch>`: 所有需要被匹配的 view 都要处于 `<Switch>` 中，判断 URL 是否匹配并渲染对应的元素，都在这里做的
+ `<Route>`: 渲染匹配 URL 时的视图，并传递

> 视图的 state 都交给 history（不是原生那个API） 处理了，router 库本身并没有处理。

## history
history 是 react-router 保证 state 和 URL 同步的核心。

### BrowserRouter
原生的 history 改变 URL 有以下几种方法：
+ history.go
+ history.back
+ history.forward
+ history.pushState
+ history.replaceState

其中，有一个事件： `popstate` ,它能够无监听 *back,forward,go* 导致的 URL 变化。同时浏览器前进、后退也会触发这个事件。

问题：
+ 直接修改 URL 是不会触发 `popstate` 的，怎么办？(我傻逼了，浏览器会刷新页面，`<Switch>选择匹配的<Route>就行了`)
+ `pushState、replaceState` 也不会触发 `popstate` ，怎么办？

针对第二个问题，可以通过 hack 手段，对原生的 `pushState、replaceState` 做一次 wrap，在 wrap 里触发一些自定义事件即可（不过 react-router 没有这么做，那他是怎么做的？`react-router居然直接忽略！！！，用原生的pushState、replaceState居然不会引起view更新`）。

### HashRouter
hash 模式下的 state 是存储在内存中的，所以刷新页面后state 会丢失。不过最新的*v5.x*，内部实现hash的时候，依然采用了 `window.history.pushState`, 只是第三个参数是类似 `#/xxx`，这样刷新页面就和 `BrowserRouter` 一样不会丢失了(当然，目前最新的 `react-router-dom` 还没有迁移到最新的 history)。

### MemoryRouter
浏览器前进后退没法用，一般不用（RN可能有用？）暂时不管这个。

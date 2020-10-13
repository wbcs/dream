# 前端路由
React:
+ react-router
+ react-router-dom

Vue:
+ vue-router

# react-router-dom

+ `<BrowserRouter>`：使用 createBrowserHistory 创建 history 传递给 react-router 的 `<Router>`(HashRouter 自然用的就是 createHashHistory)
+ `<Link>`：最终渲染的真实元素是 `<a>`, 对 onClick 做了一层代理：
  1. 忽略除鼠标左键以外的其他任何click
  2. 组合点击（功能键 + 鼠标）则不做 navigate
  3. 让浏览器处理类似 `<a target="_blank" />`(除 _self)
+ `<NavLink>`: 使用了 `<Link>` 支持对 active 的导航元素设置 style, 可以理解为定制版的 `<Link>`

# react-router

+ `<Router>`: 整个 React App 都需要处于 `<Route>` 中，因为 `<Route>` 其实是作为一个 `Context.Provider` 给其他的 react-router 组件提供数据
+ `<Switch>`: 所有需要被匹配的 view 都要处于 `<Switch>` 中，判断 URL 是否匹配并渲染对应的元素，都在这里做的
+ `<Route>`: 渲染匹配 URL 时的视图，并传递

> 视图的state都交给history处理了，router 库本身并没有处理。

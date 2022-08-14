# 前端路由之 history

首先先介绍两个东东：

H5 新增了 2 个 API：`history.pushState()`、`history.replaceState()`

这两个 APi 都接受 3 个参数：

- 状态对象，与 pushState 关联对象，只有在第三个参数的路径下才能访问。如果在相同路径下多次调用此方法，则 state 会被覆盖
- 标题，就是`<title></title>`里面的内容，不过 FF 目前会忽略该参数，未来可能会对该方法进行  修改，所以传一个空 string 比较安全。
- 地址，也就新的目的`URL`，必须和当前页面同源，否则会报错。

```javascript
history.pushState({ ... }, 'title', 'path');
```

> 其中，第三个参数可选，默认为当前路径。

这两个 APi 的相同之处在于都会操作浏览器历史记录而不会引起刷新，不同之处  在于`pushState`会添加一条新记录，而`replaceState`会替换掉当前的历史记录。

# popstate

这个事件是**有时候**路由切换时会触发, 它是绑定在**window**上的。

```javascript
window.addEventListener(
  'popstate',
  (e) => {
    console.log(e);
    // e.state就是window.state,就是对应path下的状态对象
  },
  false
);
```

> `history.pushState();`和`history.replaceState();`不会触发`popstate`事件。也就会用户点击前进后退按钮的时候或者 js 手动调用 go、forward、bak 等方法时才会触发 popstate 事件

# 其他的一些 API

一些不常用的或者一看名字就知道我就不说了，就提一点常用不好记的东西。

- length：历史记录的条数，最多 15
-

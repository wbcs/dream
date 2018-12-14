# 效果图
![](https://user-gold-cdn.xitu.io/2018/12/14/167ab8922fac7523?w=291&h=391&f=png&s=15582)

# 具体实现
```html
<div class="container">
  <div class="header"></div>
  <div class="body"></div>
  <div class="footer"></div>
</div>
```

```css
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.body {
  flex: 1;
  overflow: auto;
}
.header, .footer{
  flex: 0 0 50px;
}
```
> `flex`是`flex-grow、flex-shrink、flex-basis`的简写， 后两个要么同时省略，要么同时出现。
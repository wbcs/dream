# onscroll

`window、document、DOM`均可绑定

```js
elem.addEventListener('scroll', () => {});
```

> 要触发 scroll，elem 必须要出现滚动条 然后滚动

# scroll 属性

- scrollTop：只有 DOM 有这个东东，就是自己出现滚动条以后，被滚上去的高度。可以设置这个属性让元素内部滚动到相应的高度。
- scrollHeight：只有 DOM 有，只读，不可设置。元素滚动条内的高度。

# window 的几个 scroll 函数

`window.scroll`和`window.scrollTo`: `(x: number, y: number) => void`,滚动到(x, y)

`window.scrollBy(x, y)`, 相对于当前坐标`(x0 ,y0)`,滚动后是`(x0 + x, y0 + y)`

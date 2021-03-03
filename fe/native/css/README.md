# CSSStyleSheet

```js
const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(`
  div {
    border: 1px solid rd;
  }
`)
document.adoptedStyleSheets = [styleSheet]

// 可以修改 shadow dom 的样式
shadowRoot.adoptedStyleSheets = [styleSheet]
```

- overflow-anchor 上面有内容的时候，当前 view 不会被顶下去

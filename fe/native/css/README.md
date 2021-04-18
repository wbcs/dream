# CSSStyleSheet

```js
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(`
  div {
    border: 1px solid rd;
  }
`);
document.adoptedStyleSheets = [styleSheet];

// 可以修改 shadow dom 的样式
shadowRoot.adoptedStyleSheets = [styleSheet];
```

- overflow-anchor 上面有内容的时候，当前 view 不会被顶下去

- word-wrap(overflow-wrap):

  - normal
  - break-word 同 `word-break:break-all`

- word-break

  - normal
  - keep-all 单词超长不换行，只有遇到空格时，才会折行
  - break-all 单词超长折行

- white-space:
  - normal
  - no-wrap: 不自动换行 空格、回车不保留
  - pre: 不自动换行 空格、回车保留
  - pre-wrap: 自动换行 空格、回车保留
  - pre-line: 自动换行 空格合并，回车保留

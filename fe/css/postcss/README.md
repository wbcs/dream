postcss 之于 css 相当于 babel 之于 JavaScript

## 编写一个 postcss plugin

```js
function postcssPlugin() {
  return (root, result) => {
    // API 顾名思义 遍历所有规则
    root.walkRules((rule) => {
      // 遍历所有声明块
      rule.walkDecls((declaration) => {});

      // 添加一个属性
      rule.append({ prop: 'border', value: '1px solid red' });
    });
  };
}
```

项目中遇到过这样一个问题：开发一个 SDK，SDK 采用了组件库，而组件库修改了全局的一些样式，比如 html,body 的 margin,padding 等，这可能会对接入方的样式造成影响。所以我想给我的 SDK 中所有 CSS 选择器都添加一个命名空间，这样就能够避免影响到接入方了。

```js
function postcssPluginNamespace(opts = { namespace: '.namspace-class' }) {
  return (root, _result) => {
    root.walkRules((rule) => {
      // @frameworks animation-name { 100% {} }
      // 这种case需要忽略
      if (rule.type === 'atrule' || rule.parent.type === 'atrule') return;
      rule.selector = withNamespace(rule.selector.split(','), namespace);
    });
  };
}

function withNamespace(selectors, namespace) {
  return selectors.map((selector) => `${namespace} ${selector}`).join(',');
}
```

# 什么是组件？

一个组件对应页面上的某一块 section，可以是一部分 HTML。不过现在主流框架都是先将 state 转换为 VNode，当 props 变化的时候，根据新的 props 和之前的 VNode 去修改需要变动的地方，得到新的 VNode，这个过程称为 patch。

也就是说，一个 component 得到的是一个 VNode。根据 data 的改变，更新 VNode 的过程叫做 patch。根据 VNode 得到最终的 HTML/DOM 称为 render。

```js
let VNode = <Compnent />;
VNode = patch(prevVnode, newVNode);
render(VNode, container);
```

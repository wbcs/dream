# 什么是组件？
一个组件对应页面上的某一块section，可以是一部分HTML。不过现在主流框架都是先将state转换为VNode，当props变化的时候，根据新的props和之前的VNode去修改需要变动的地方，得到新的VNode，这个过程称为patch。

也就是说，一个component得到的是一个VNode。根据data的改变，更新VNode的过程叫做patch。根据VNode得到最终的HTML/DOM称为render。

```js
let VNode = <Compnent />;
VNode = patch(prevVnode, newVNode);
render(VNode, container);
```
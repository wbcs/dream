# MVVM

Model-View-ViewModel 的缩写。

## 出现的原因

MVC 架构模式对于简单的应用是 OK 的，但是随着 H5 的发展，应用的复杂度越来越复杂，就暴漏出一些问题：

1. 开发的过程中，要调用大量的相同 API 去操作 DOM,操作冗余、难以维护；
2. 频繁的操作 DOM 会多次引发 reflow、repaint 造成掉帧、卡顿的情况，影响用户体验
3. 当 Model 频繁变化的时候，需要主动更新 View，如果 View 经过交互也发生变化，又需要把相应变化的数据同步到 Model 中。十分品所、难以维护复杂多变的数据。
   > JQuery 的出现就是解决了第一个问题

MVVM 很好的解决了上述问题。

## MVVM 架构

Model-View-ViewModel 三部分，View 和 Model 相互独立，通过 ViewModel 层进行交付。Model 跟 ViewModel 是双向的，因此 Model 的变化会立刻反应到 View 上。

ViewModel 把 View 跟 Model 自动连接在一起，开发者就只需要关注业务逻辑，而不需要根据 Model 的变化再去主动修改 View 了。

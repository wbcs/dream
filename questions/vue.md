# MVVM
Model-View-ViewModel的缩写。

## 出现的原因
MVC架构模式对于简单的应用是OK的，但是随着H5的发展，应用的复杂度越来越复杂，就暴漏出一些问题：
1. 开发的过程中，要调用大量的相同API去操作DOM,操作冗余、难以维护；
2. 频繁的操作DOM会多次引发reflow、repaint造成掉帧、卡顿的情况，影响用户体验
3. 当Model频繁变化的时候，需要主动更新View，如果View经过交互也发生变化，又需要把相应变化的数据同步到Model中。十分品所、难以维护复杂多变的数据。
> JQuery的出现就是解决了第一个问题

MVVM很好的解决了上述问题。

## MVVM架构
Model-View-ViewModel三部分，View和Model相互独立，通过ViewModel层进行交付。Model跟ViewModel是双向的，因此Model的变化会立刻反应到View上。

ViewModel把View跟Model自动连接在一起，开发者就只需要关注业务逻辑，而不需要根据Model的变化再去主动修改View了。
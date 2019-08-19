# 组件的本质
组件的本质就是函数，组件的产出的VNode。

组件之所以要产出VNode，而不直接产出HTML，是因为VNode带来了分层设计，对渲染的过程进行了抽象，使得框架除了能够在web浏览器上使用以外，还能够在其他平台使用，比如RN、SSR的实现等等都是因为VNode。

# VNode的分类
VNode描述不同的元素，它的属性也不同，比如描述html和描述一个组件的VNode，它的tag一个是string，一个是对应的组件名

其实通过判断tag也能够判断出当前的VNode，然后执行相应的操作。那为什么还要给VNode单独设置一个标志，来作为区分VNode的标识呢？

答案是为了优化。

因为上述的判断，这些过程都在mount的阶段或者叫做patch的阶段进行，VNode到底描述的是什么只有在执行的时候才知道，这就带来了两个难题：
+ 无法从AOT的层面进行优化
+ 开发者无法进行手动优化

通过在VNode上添加标记，可以直接根据flag来判别，不需要进行过多的判断。
> 比如如果没有flag，我们先判断组件tag是否为string，如果是string则为html，否则是组件，那组件又分为函数组件或者类组件，操作又不相同；还有portal、fragment等等情况。所以框架一般都使用位运算来进行判别，通过对1进行左移，设置类型，然后通过flag和这个类型进行与运算就能够得出当前组件是否为某个类型的组件了。非常的快速。
```js
const VNodeType = {
  TEXT: 1 << 0,
  HTML: 1 << 1,
  COMPONENT: 1 << 2,
  PORTAL: 1 << 3,
  FRAGMENT: 1 << 4,
  ...
}

if (VNode.flag && VNodeType.HTML) {
  // 当前的VNode描述的HTML
}
```

# children和childrenFlags
VNode进行分类能够优化，children作为一个重点一样可以。

比如某个组件的children：
+ 没有
+ 只有一个
+ 有多个
  + 都有key
  + 没有key
+ 不知道

这些在diff的过程中是很有帮助的
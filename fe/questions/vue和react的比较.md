# 理念上的差异

## Vue

采用对对象属性修改的拦截，对数据的变化更敏感、精确。

数据改变多少，我就 update 多少 效率较高。

## React

采用局部刷新（当然 Vue 肯定也是局部的），但是 React 不知道什么时候更新，所以暴漏一个`setState`，让 developer 自行调用 以此触发一个更新请求。

相比于 Vue 的依赖跟踪，React 需要进行 diff 来减少不必要的更新，并且提供一个`SCU`。

## 既然 Vue 在更新方面效率更高，为什么还说 React 适合大型项目？

Vue 在数据量较小的时候对每个 data 进行检测，自动完成数据的更新。但是一旦项目体积过大，会有很多 state，就会有很多 watcher，有的 watcher 是不必要的（比如我有可能只在一开始改变一次数据，或者我的数据就是死的）但 Vue 依然会对每个 data 进行深度监测。这些 watcher 占用内存会导致页面卡顿。

而 React 是用户自己去`setState`，数据是 immutable，推崇数据不可变、单项数据流。这个时候 React 更加可控。

> 这个情况应该会随着 Vue3.0 的出现有所改善，因为它使用 proxy 重构之后对对象的监听只需要在最外层即可，不需要递归地将所有子对象都变成响应式的(mobx 已经这么干了)

# template vs jsx

## jsx

首先明确一点，`React`和`Vue`都支持`jsx`。但`Vue`的`jsx`不是主要卖点，它的很多特性都是更好的针对`template`而言的。

`jsx`本质上就是函数调用，所以它能够实现`JavaScript`能实现的一切东西，图灵完备。写起来没有任何的限制，非常爽，这也是我比较偏爱`React`的一个原因。

它揭示了一个东西：组件是函数，视图又是由多个组件共同构成的，而函数执行的结果是`VNode`，也就是数据。

> `VNode`的价值不仅仅在于它可以只更新需要更新的`DOM`，不会造成过量的`repaint、layout`等浏览器性能方面的东西。更大的价值在于它的跨平台性。通过将视图抽象成`VNOde`，这些`VNode`可以被任何可以处理数据的平台去渲染，由此可以实现跨平台的目的。`RN、Weex`的原理就是这样的，`RN`去构建`View`，然后将结果(`VNode`)通过`JSBridge`传递给`Native`，`Native`拿着这些`VNode`使用`Native`的`UI`去渲染。

但是因为`jsx`的灵活，较`template`而言就有了一些缺点。比如：

```jsx
<ul className="list">
  <li>li0</li>
  <li>li1</li>
  <li>li2: {message}</li>
  <li>li3</li>
</ui>
```

在这段代码中，只有第 3 个 li 的`innerHTML`会随着`message`改变而改变，其他部分都是确定不会变的。但是因为`jsx`的动态性，他每次都会重新执行`render`，得到新的`element`，然后去`diff` 得出`message`到底有没有变，然后去刷新视图。这个过程其实做了很多多余的事情，因为很多情况我们提前就能知道结果。

正是因为`jsx`的动态性，导致难以优化，因为上面的 code 本质上是一堆函数的调用，`React`只能在对函数的返回值进行分析之后才能得出结果。

因为函数调用堆栈阻塞主线程等一系列问题，`React`最终选择给任务添加优先级，使用任务调度算法，将这些庞大的计算量分布到每一帧去做，达到了一定的优化效果。

## template

反观模板，它对写法是有一定限制的，不像`jsx`那么灵活，你需要按照模板的规则去编写。但正是因为这一点，在优化方便要比`jsx`好一些。

同样对于上面的代码：

```js
<template>
  <ul class="list">
    <li>li0</li>
    <li>li1</li>
    <li>li2: {{message}}</li>
    <li>li3</li>
  </ui>
</template>
```

我们知道`template`最终也是要被编译到`render`函数中去的，在从模板到`render`的过程中是可以进行编译时优化的。

通过分析就能知道，这些元素`ul、li`，只有`message`那里会变，所以它在判断的时候，只会判断如果`message`更新了，才会去更新视图，不会每次都新创建`VNode`。非常高效。

> `template`的编译时优化，能够让`runtime`能够更轻量。而且它也不需要什么优先级、调度算法等等，所以体积也会更小

在上面结构不会改变的情况下是不需要`diff`的，`render`中触发 get，将`message`改变后更新对应视图的操作作为依赖就能达到高效快速的更新的。但是对于`v-if`这样的条件渲染，就会导致结构有可能改变。这个时候就需要`diff`了：

```jsx
<template>
  <ul class="list">
    <li v-if="hehe">li0</li>
    <li>li2: {{message}}</li>
    <li>li3</li>
  </ui>
</template>
```

`Vue`的`diff`也不用像`React`那样递归到叶子节点，因为在`v-if`之外的`ul`，它是不变的，只是第二个`li`有可能有或没有。而且在`li`内部也不会变，所以只需要将整个`DOM tree`分成几个`block`，`ul`是一个，`li`又是多个，只需要对这些`block`进行`diff`即可，不需要对`li`内部进行`diff`。这个点相对于`React`来说也是要少做很多事情的。

除了这些，`Vue`的编译时还能判断出那些`props`是常量的地方，这些在`diff`的时候也不会像`React`那样一视同仁一起去进行比较，在比较的时候根本不用管这些东西（这一点在`Vue2.x`中还没实现，使用的跟`React`一样都是完全的`diff`，`Vue3.0`已经在这方面下手了）

## 总结一下 jsx 和 template

`jsx`的优点：

- 图灵完备，不受任何限制，非常灵活
- 可以直接在组件上写任何复杂的逻辑
- 允许将视图看做是数据

`jsx`的缺点：

- 过于灵活，无法在编译时进行一些优化
- 因为灵活，导致每次更新都需要去`diff`到组件树的最深层次
- 因为完全的`diff`运算量过大阻塞主线程，在使用`Fiber`重构之后，又因为需要进行任务调度，从而不得不加载体积庞大的调度相关代码
- 对于一些常量属性也必须进行`diff`

- React diff 算法在判断到 children 不同的地方，在其之后的结点会被全部干掉，重新构建，不能利用后续相同的结点（弥补方式是添加 key）

`template`优点：

- 对写法有一些限制，可以在`template` =>` render`的过程中通过编译分析得出需要更新的部分，而无需重复构建`VNode`
- 对于结构可变的情况，需要`diff`，但它也不用`diff`到叶子节点，因为节点内部的结构依然不会变（有就递归操作）不用像 React 那样进行完全的`diff`。
- 在`diff`的过程中不需要对常量属性进行`diff`

`template`的缺点：

- 不够灵活，在写法上存在一些限制
- 对于一些逻辑复杂的组件，直接使用`jsx`有可能非常简单， 但是对应的方式`template`可能不支持，就导致需要另辟蹊径去实现

而且`Vue`的`template`自带预编译优化。而`React`拿到的是一堆`React.createElement`的调用，没办法做一些预编译的优化

# 事件系统的差别

## Vue

提供指令，直接在`DOM`上`addEventListener`。

对于一下情况：

```html
<ul>
  <li v-for="item in list" @click="handleClick"></li>
</ul>
```

`Vue`会给所有的`li`绑定`click`，没有进行事件委托。

## React

自己封装了一套事件系统，全部委托在`document`上。事件被触发之后，再取得`target`的`fiber`，依次向上遍历，判断如果这个结点绑定了同类型事件则触发，否则跳过。

> React 通过直接的 DOM 上绑定`fiber`的方式，就能够在事件被触发的时候直接取得`target`的`fiber`，然后根据`return`等属性就能够遍历整个`tree`

# 组件复用

几种复用方式：

- mixin
- HOC

`mixin`存在以下问题：

- 命名冲突：不同`mixin`有可能用到相同的属性名称
- 数据来源不清晰：很难直接知道某个属性是来自哪个`mixin`
- 不同的`mixin`之间可能会相互依赖

`HOC`存在以下问题：

- 不遵守约定有时候也会造成 props 的命名冲突
- 嵌套地狱问题

## React 的组件复用

React 原来也是通过`mixin`来进行组件复用的，但是废弃了(mixin 缺点)。

于是 React 采用`HOC`。但是 HOC 也存在命名冲突的问题，并且会产生嵌套地狱（因为总是要包一层）。

```js
function Visible(Component) {
  return function (props) {
    const { visible, ...others } = props;
    if (!props.visible) return null;
    // 在不遵守约定的情况下，someprops有可能会和others冲突
    return <Component someprops={'hehe'} {...others} />;
  };
}
```

> HOC 除了嵌套地狱以外，还存在 ref 无法传递的问题，当然 React 推出 forwardRef 解决了它。

之后 React 引入`hooks`解决问题。

## Vue 的组件复用

现在 Vue 支持的复用方式有：

- mixin
- HOC（尽管实现比较费劲）
- slot-scope

因为`mixin、HOC`的缺点，而且`slot-scope`和`HOC`类似也需要包一层（当然`Vue`有`template实`际不会渲染出来，但是开发的时候依然是要包一层的，React 也一样）。

所以`Vue`也抄了一下`hooks`（对应叫`value`,虽然实现的原理不同，但是复用的思想类似）。

## 组件复用总结

组件复用方面，现在 React、Vue 都在向`hooks`靠拢。
同时支持`HOC`（Vue 主要使用`slot-scope`）。
Vue 还支持 mixin，尽管它存在一些问题。

hooks 的优点：

- 不会产生嵌套地狱（HOC 的缺点）
- 多个 hooks 之间互不影响（mixin 的缺点）
- 没有 namespace 的问题（HOC、mixin 的缺点）
  > 除了这些，还增强了可读性，不会和 mixin 一样，一眼看去不知道某个属性是来自哪个 mixin 的；使 function Component 有了 state，就能够不用 class。

class 的缺点：

- 体积较 function 大，因为涉及到继承、平台不支持时很多 helper 函数等
- componentDidMount 中将一些无关逻辑写在一起，可读性差
- 代码压缩方面也只能对 class name 进行重命名（可以看到有些地方直接就编译成 a、b、c 等一个字母减少文件体积），但是 class 的属性名就没办法压缩了。而函数组件就不存这个问题。

# 数据流

`React` 和 `Vue` 现在都是推崇单项数据流，但是 `Vue` 目前依然还是支持双向数据流（双向数据绑定）。

其实本质上就是，单项数据流对更改 `state` 的操作是需要手动调用，触发响应的事件来更新。而双向数据流是由框架隐式的去修改。

> 本质都是通过事件来修改。

单向数据流：

- 优点：
  - 所有状态的变化都能被记录、跟踪，通过手动调用源头容易追溯
  - 组件数据有唯一的入口和出口，程序更加易于理解、便于调试
- 缺点：
  - 代码量会多一些
  - 状态独立管理的要求比较严格，对于一些表单、富文本等应用，不像双先绑定那么简洁，会有一些繁琐

双向数据流：

- 优点：
  - 变更状态由框架隐式完成，简化大量业务无关代码，代码会很简洁
- 缺点：
  - 存在暗箱操作，无法追踪局部状态的变化，潜在的行为增加出错的概率
  - 数据变化的来源可能不止一个，调试难度大
    > 有点观点还提出，双向数据还有可能导致使用引用计数的 GC 内存泄漏

# 路由

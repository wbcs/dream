# 理念上的差异
## Vue
采用对对象属性修改的拦截，对数据的变化更敏感、精确。

数据改变多少，我就update多少  效率较高。
## React
采用局部刷新（当然Vue肯定也是局部的），但是React不知道什么时候更新，所以暴漏一个`setState`，让developer自行调用 以此触发一个更新请求。

相比于Vue的依赖跟踪，React需要进行diff来减少不必要的更新，并且提供一个`SCU`。

## 既然Vue在更新方面效率更高，为什么还说React适合大型项目？
Vue在数据量较小的时候对每个data进行检测，自动完成数据的更新。但是一旦项目体积过大，会有很多state，就会有很多watcher，有的watcher是不必要的（比如我有可能只在一开始改变一次数据，或者我的数据就是死的）但Vue依然会对每个data进行深度监测。这些watcher占用内存会导致页面卡顿。

而React是用户自己去`setState`，数据是immutable，推崇数据不可变、单项数据流。这个时候React更加可控。

# 事件系统的差别
## Vue
提供指令，

## React
自己封装了一套事件系统，全部委托在document上

# template vs jsx
首先明确一点，React和Vue都支持jsx。但Vue的jsx不是主要卖点。

而且Vue的template自带预编译优化。而React拿到的是一堆`React.createElement`的调用，没办法做一些预编译的优化

# 组件复用
几种复用方式：
+ mixin
+ HOC

`mixin`存在以下问题：
+ 命名冲突：不同`mixin`有可能用到相同的属性名称
+ 数据来源不清晰：很难直接知道某个属性是来自哪个`mixin`
+ 不同的`mixin`之间可能会相互依赖

`HOC`存在以下问题：
+ 不遵守约定有时候也会造成props的命名冲突
+ 嵌套地狱问题
## React的组件复用
React原来也是通过`mixin`来进行组件复用的，但是废弃了(mixin缺点)。

于是React采用`HOC`。但是HOC也存在命名冲突的问题，并且会产生嵌套地狱（因为总是要包一层）。
```js
function Visible(Component) {
  return function(props) {
    const {visible, ...others} = props;
    if (!props.visible) return null;
    // 在不遵守约定的情况下，someprops有可能会和others冲突
    return <Component someprops={'hehe'} {...others} />
  };
}
```
> HOC除了嵌套地狱以外，还存在ref无法传递的问题，当然React推出forwardRef解决了它。

之后React引入`hooks`解决问题。
## Vue的组件复用
现在Vue支持的复用方式有：
+ mixin
+ HOC（尽管实现比较费劲）
+ slot-scope

因为mixin、HOC的缺点，而且`slot-scope`和`HOC`类似也需要包一层（当然vue有template实际不会渲染出来，但是开发的时候依然是要包一层的，React也一样）。

所以Vue也抄了一下`hooks`（对应叫value）。
## 总结
组件复用方面，现在React、Vue都在向`hooks`靠拢。
同时支持`HOC`（Vue主要使用`slot-scope`）。
Vue还支持mixin，尽管它存在一些问题。

hooks的优点：
+ 不会产生嵌套地狱（HOC的缺点）
+ 多个hooks之间互不影响（mixin的缺点）
+ 没有namespace的问题（HOC、mixin的缺点）
> 除了这些，还增强了可读性，不会和mixin一样，一眼看去不知道某个属性是来自哪个mixin的；使function Component有了state，就能够不用class。

class的缺点：
+ 体积较function大，因为涉及到继承、平台不支持时很多helper函数等
+ componentDidMount中将一些无关逻辑写在一起，可读性差


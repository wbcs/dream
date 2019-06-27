# 更新理念上的差异
## Vue
采用对对象属性修改的拦截，对数据的变化更敏感、精确。

数据改变多少，我就update多少  效率较高。
## React
采用局部刷新（当然Vue肯定也是局部的），但是React不知道什么时候更新，所以暴漏一个setState，让developer自行调用 以此触发一个更新请求。

相比于Vue的依赖跟踪，React需要进行diff来减少不必要的更新，并且提供一个CSU。

# 事件系统的差别
## Vue
提供指令，

## React
自己封装了一套事件系统，全部委托在document上

# template vs jsx
首先明确一点，React和Vue都支持jsx。但Vue的jsx不是主要卖点。

而且Vue的template自带预编译优化。而React拿到的是一堆React.createElement的调用，没办法做一些预编译的优化
# JSX
```html
<div>
    Content1
    Content2
</div>
```
地球人都知道JSX通过babel编译，实际上等价于：
```javscript
React.createElement(
	'div', 
	{className: 'cn'},
	'Content1',
	'Content2'
);
```
`React.createElement()`：
### 参数①：
+ 对于原生的html标签， 第一个参数是其对应的tag name字符串
+ 对于ReactComponent，则是对应的组件的字符串(React根据字符串首字母大小写来判断是组件还是html标签)
### 参数②
是标签上对应的属性对象`props`
### 参数③及以后
是对应的children，可以是：
+ 字符串
+ 组件
+ 数组，可以是数组的原因是：React可以将children分组，作为一个参数传递
+ html原生标签，也就是会调用`React.createElement`的东东
+ 基本类型：`false、true、null、undefined`

## 将参数传入React.createElement后，会得到虚拟DOM：
```javascript
{
	type: 'div', // 如果是React Component 此处位对应组件的function、class 的引用
	props:{
		className: 'cn',
		children: [
			'Content1',
			'Content2',
		]
	}
}
```
> ps: 无论`children`是作为数组还是参数列表传递都没关系 —— 在生成的虚拟DOM对象的时候，它们最后都会被打包在一起的。

# ReactDOM.render()
等到虚拟`DOM`对象完成创建之后，`ReactDOM.render`会按照以下规则将其转换为浏览器可识别的`DOM`：
+ 1. 如果`type`是`string`，则创建该类型的`HTML`标签，附带上`props`的所有属性
+ 2. 如果type是函数（类），调用它，对其结果递归重复这个过程。
+ 3. 如果props下有children，则在父节点下，针对每个child重复以上过程。

最终得到原生的HTML

# state发生变化时，更新
`ReactDOM.render()`在根节点上调用一次后，后续的更新都是通过state来更新的。

当一个页面不是重新更换掉`ReactDOM.render`中的参数时，React内部会更新，流程如下：

在同一个Node节点再次执行`ReactDOM.render`，启用`diff`，而不是从头到尾再次重新创建所有的DOM节点。进而确定DOM中哪些节点需要更新，哪些保持不变。


## 具体过程

虚拟DOM放这方便看：
```javascript
{
	type: 'div', // 如果是React Component 此处位对应组件的function、class 的引用
	props:{
		className: 'cn',
		children: [
			'Content1',
			'Content2',
		]
	}
}
// 如果是组件，则是：
{
	type: Component,
	props: {},
}
```
### type为string时
+ 先判断string是否和之前一样。如果不一样，直接干掉(unmount)当前DOM和其children。否则判断props。
+ 如果props没变，则DOM保持不变，否则React调用标准API修改DOM的属性，判断children的具体过程请看下文。

### type不是string(对应class、function的引用)
+ 检查组件内部逻辑，根据render返回的值来进行判断(过程同string)。

### 比较children的过程
如果子元素是一个数组，并且他们有key，则根据children的key来判断是否跟未更新时是同一个元素，如果key一样，则保留它，这样如果有子元素被删除的情况，只是改变剩下元素的顺序就可以了。

而如果children没有key，这个时候React会将children看做是一个数组(其实children本身就是数组)，根据数据的index来逐个比较。这个时候如果有被删除的子元素，则会让React把从不一样的元素之后的所有子元素全部干掉，然后重新生命、mount。这个代价是很大的，这也是为什么不要把index作为key的原因。
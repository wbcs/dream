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
其中`React.createElement()`：
### 参数①：
+ 对于原生的html标签， 第一个参数是其对应的tag name字符串
+ 对于ReactComponent，则是对应的function或class的引用
### 参数②
是标签上对应的属性对象props
### 参数③及以后
是对应的children，可以是：
+ 字符串
+ 组件
+ 数组，可以是数组的原因是：React可以将children分组，作为一个参数传递
+ html原生标签，也就是会调用`React.createElement`的东东
+ 基本类型：`false、true、null、undefined`

将参数传入React.createElement后，会得到虚拟DOM：
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




# React的一些优化点
## 内敛参数的优化
我们都知道`React`更新的时候会重新执行`render`得到`VNode`，然后进行`diff`。所以一旦存在内敛变量，就会导致重新进行不必要的更新。所以解决办法是不要传递内敛的东西，可变的东西放到`state`中，不可变的放到`this`中。

但是在一些事件`handle`中，需要给`cb`传递一些参数：
```tsx
class App extends React.Component {
	handleClick = (e: React.MouseEvent<HTMLButtonElement>, arg: string) => {
		// ...
	}
	render() {
		return (
			<div>
				<button onClick={(e) => this.handleClick(e, 'args')}>click me</button>
			</div>
		)
	}
}
```
这个时候如果子元素是组件，则应该把参数传递给组件，然后子组件从`props`取值传递就行了。
如果是`DOM`，常见的做法是把参数放到`dataset`中。

>　但是对于children就没有办法了，可以考虑使用`renderProps`

## SCU, React.memo, PureComponent
在父组件频繁更新的时候，有可能传递给子组件的`props`却没有变，这样会到值子树全部频繁更新。所以`React`给开发者提供了一个SCU。让开发者来决定是否要更新子树：
```tsx
class Hehe extends React.Component {
	shouldComponentUpdate(nextProps, nextState) {
		return true
	}
}
```
而PureComponent则是React进行一次默认的shallow diff,等价于:
```tsx
class Hehe extends React.Component {
	shouldComponentUpdate(nextProps) {
		// 这里只对props进行ｄｉｆｆ
		const prevProps = this.props
		if (Object.is(prevProps, nextProps)) return false
		if (
			typeof prevPrpos !== 'object'	&& prevProps !== null ||
			typeof nextProps !== 'object' && nextProps !== null
		) {
			return true
		}
		const prevKeys = Object.keys(prevProps)
		const nextKeys = Object.keys(nextProps)

		if (prevKeys.length !== nextKeys.length) {
			return true
		}

		return !prevKeys.every(key => {
			return Object.is(prevProps[key], nextProps[key])
		})
	}
}

class Hehe extends React.PureComponent {
}
```
至于`React.memo`则可以认为是`function component`的`SCU`，只不过它的返回值和`SCU`作用相反，更新`return false`, 反之 `return true`

不过需要注意的一点就是，一旦父组件给子组件传递的`props`存在内敛或者`children`就不要用了，因为结果一定是会更新，这个时候的`shallow diff`是没有意义的

## React.createContext
在多个不同层级的组件们需要使用相同的数据的时候，这个时候可以使用`React.createContext`
```tsx
const { Provider, Comsumer } = React.createContext('defaultValue')

const app = () => {
	return (
		<Prodiver value="your-fucking-value">
			<Component />
		</Provider>
	)
}
const Component = () => {
	return (
		<Consumer>
			{value => (
				// ...
			)}
		</Consumer>
	)
}
```
> 如果只是为了避免传递props，在需要的props过多的情况下，可以通过组件组合来写。

`context`的数据不会因为父组件在`SCU return false`而没有更新.还有一点就是，最好在`<Provider value={}>`传递的value不要是内敛的，因为这样一旦当前组件频繁刷新，就会造成所有使用这个context的组件全部刷新，影响效率。

## code split
现在的ＳＰＡ把资源打包到一起，造成首屏过慢，所以可以考虑首次加载只下载需要的代码，因为有的代码可能永远也不会用到。
```js
import('./module').then(obj => {
	// ...
})
```
webpack解析到这个语法之后会自动进行代码分割。不过对于代码分割也要一些技巧，不能影响用户体验，最常用的做法就是根据路由来分割代码：
```tsx
// router.ts
export default [{
	path: '/your-path',
	component: lazy(() => import('./your-component'))
}]

// app.tsx
import { Suspense } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Routes from './router'

const App: React.SFC<{}> = () => (
	<Router>
		<Suspense fallback={<Loading />}>
			<Switch>
				{Routes.map(route => <Route path={route.path} component={route.component} />)}
			</Switch>
		</Suspense>
	</Router>
)
```
> 在页面跳转的时候，人们都习惯有一个加载的东东

其他代码分割的方案 [Suspense lazy](Suspense%20lazy.md)
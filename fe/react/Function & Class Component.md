# 函数组件和类组件
+ 他们的区别是什么？
+ `React`是如何区分他们的？

# 区别
## jsx写法
```js
// 使用上没有区别，是Function Component还是Class Component不重要
<Greeting />
```
## React内部调用
如果 `Greeting` 是 `Funtion Component`，只是在得到其虚拟`DOM`时会调用它，而且没有生命周期钩子（hooks不是生命周期）：
```js
function Greeting() {
  return <p>Hello World!</p>;
}

const result = Greetring(props);
```

如果是 `Class Component`， 则 `React` 会先创建它的实例，然后在相应的阶段，调用相应的生命周期的钩子函数，得到其具体的虚拟`DOM`是调用 `render` 方法：
```js
class Greeting extends Component {
  render() {
    return <p>Hello World</p>;
  }
}

const ins = new Greetring(props);
ins.props = props;
const result = ins.render();
```
## ☝️很重要的🌰
```js
function Profile(props) {
  const handleClick = () => {
    setTimeout(() => {
      alert(props.username);
    }, 3000);
  };

  return <button onClick={handleClick}>click me</button>
}

class Profile extends Component {
  handleClick = () => {
    setTimeout(() => {
      alert(this.props.username);
    }, 3000);
  }
  render() {
    return <button onClick={this.handleClick}>click me</button>
  }
}
```
以上代码乍一看逻辑上好像是完全等价的。但是：
```js
class App extends Component {
  state = {
    username: 'Bruce'
  };
  handleClick = () => {
    this.setState({
      username: 'BATMAN'
    });
  }
  render() {
    const {username} = this.state;

    return <div onClick={this.handleClick}>
      <Profile username={username} />
    </div>;
  }
}
```
好像也没什么区别。但是当 `Profile` 是 `Class Component` 的时候，`alert` 出来的是 `'BATMAN'` , 而 `Function Component` `alert` 出来的是 `'Bruce'`.

### 为什么会这样？

无论是 `class` 还是 `Function`， 都是从 `props` 里提取 `username`。但是函数组件就是之前没有改变的值，而类组件是更新后的值。

原因是：`props`在函数组件中是永远不会变的。因为函数组件更新`React`都会重新执行函数，每次执行函数，函数都会有自己的作用域，`props`是参数，自然就不会变了。

而类组件在更新的时候，会更新实例的属性。实例依然是原先是实例，只不过`props` 的值更新了而已。

这就造成同样是从`props`读取属性，`alert`的时候函数组件的`props`还是原来的`props`，而类组件的`props`已经更新了.
> 这也是为什么公司在提取属性的时候都选择解构赋值（`const {username} = this.props;`），而不是直接读取属性的原因了。

### 如果函数组件想要类似类组件的行为怎么办？
直接上代码：
```js
const [username, setUsername] = useState('Bruce');

const ref = useRef(username);
useEffect(() => {
  ref.current = username;
}, [username]);

const handleClick = () => setTimeout(
  () => alert(ref.current),
  2000
);
const updateUsername = () => setUsername('BATMAN');

// 省略
```

# React如何区别他们？
在声明这两种组件的时候，`Class Component` 需要继承 `Component`， `React` 是通过在 `Component.prototype` 上添加 `isReactComponent` 来区分两者的：
```js
Component.prototype.isReactComponent = {};

class ClassComp extends Component {
  // ...
}
function FuncComp() {
  // ...
}

ClassComp.prototype.isReactComponent; // {}
FuncComp.prototype.isReactComponent;  // undefined
```

# 总结
总结一下 `Class Component` 和 `Function Component` 的区别：
1. `React`内部调用不同：前者创建`instance`然后`instance.render()`；后者直接执行本身。
2. `props`可变性不同：前者`props`会动态更新（更新的时候会改变`instance`的属性）；后者的`props`是一定不会改变的（因为每次执行都会有不同的作用域，而它们是独立的）。
3.  类组件还有生命周期钩子。

> 由于hooks的出现，有无状态已经不是函数组件跟类组件的区别了！

# 参考
[从源码剖析useState的执行过程](https://juejin.im/post/5cc809d2f265da036c579620)

[How Are Function Components Different from Classes?](https://overreacted.io/how-are-function-components-different-from-classes/)
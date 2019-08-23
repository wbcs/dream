# 函数组件和类组件
+ 他们的区别是什么？
+ `React`是如何区分他们的？

# 区别
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

## 保存状态的区别
class component使用state来保存状态, setState来更新状态。

function component使用hooks来保存、更新状态

## 生命周期的区别
class component在创建实例到得到VNode的过程中需要执行一系列的生命周期函数，而function component则只需要执行函数本身即可。十分的高效

## ☝️props的可变性
很重要的🌰
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

## 执行效率上的区别
类组件因为要创建实例、继承、执行各个生命周期钩子函数，相比于函数组件要笨拙一些，不像函数组件那么轻量。除此之外呢，在使用构建工具转译之后，类组件还会有大量的helper函数，体积会进一步扩大。

而函数组件的问题在与使用hooks保证状态的同时，造成了大量的内敛变量。导致组件频繁的刷新，这一点也没有办法使用React.memo来解决，因为索引变了。除此之外，传递给hooks的初始值，只在第一次执行的时候有用，后续更新阶段，这个初始值是没有用的，但是因为更新执行函数组件本身，就导致每次都会创建无用的值，给ＧＣ造成了压力。

> 不过好在函数组件的轻量，这些问题即使存在　也不会比class component慢多少。

## 优化策略
类组件可以使用PureComponent、SCU这种优化。而函数组件则对应有React.memo


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
+ 内部执行逻辑不同：前者需要创建实例、执行生命周期钩子函数、执行`render`得到`VNode`;而后者只需要执行函数本身即可
+ `props`的可变性：前者通过`this.props`读取`props`的属性时，在涉及到异步操作时，在`callback`执行的时候，实际上会拿到最新的值；而后者因为函数`ｓｃｏｐｅ`的问题，`props`永远都是当前的值，不可变。
+ 保存状态的方式不同：前者直接在`this.state`即可；后者需要借助`hooks`来实现
+ 优化方面：前者`PureComponent、SCU`；后者`React.memo`
+ 执行效率：类组件更加笨重一些；函数组件更加轻量
+ 体积：类组件在转译之后会有很多`helper`函数，体积会大大超过函数组件。并且函数组件的函数名是可以被压缩的，但是类组件的话只能压缩其`className`，它的属性不能压缩。所以会进一步导致函数的体积远小于类组件

# 参考
[从源码剖析useState的执行过程](https://juejin.im/post/5cc809d2f265da036c579620)

[How Are Function Components Different from Classes?](https://overreacted.io/how-are-function-components-different-from-classes/)
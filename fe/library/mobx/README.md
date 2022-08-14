# mobx

这玩意儿跟 `Vue` 有点像，之前以为它跟 `redux` 差不多都是 `immutable` ，结果发现完全相反。

`React` 自己要通过 `setState` 去更新，用了 `mobx` 自动对值进行 `proxy` ，再配合 `observer` ，就能够实现和 `Vue` 类似的改动 `state` 自动更新视图的效果了。

> 但是它只会调用 `CWD` 和 `CDU` 以及 `render` 等生命周期，其他生命周期是不会被调用的。 如果需要生命周期函数，使用正常的 `setState` 即可。

# 用法

```jsx
// 前者用来观察值，后者则负责改变值
// 修改mobx最好放在action中，
import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

const state = observable({
  counter: 0,
});

const App = observer((props) => {
  const { counter } = porps.state;

  const handleClick = action(() => state.counter++);
  return (
    <div>
      counter is : {counter},
      <button onClick={handleClick}>
        click me to increment counter's value.
      </button>
    </div>
  );
});

export default () => <App state={state} />;
```

这样就能实现一个非常简单的计数器。

函数式的方式显得有点冗余，结合 `es7` 的 `decorator` 进一步让代码清晰：

```jsx
import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

@observer
class App extends React.Component {
  @observable counter = 0;
  // this永远都是正确的
  @action.bound
  handleClick() {
    this.counter++;
  }

  render() {
    const { counter, handleClick } = this;
    return (
      <div>
        counter is: {counter},
        <button onClick={handleClick}>
          click me to increment counter's value.
        </button>
      </div>
    );
  }
}

export default App;
```

简洁多了。

> `action` 和 `action.bound` 的区别就是后者在调用前者的基础上又绑定了 `context`。

## decorator 和函数调用的联系

- @observable: `observable.deep` (其实就是 `observable` ， `observable` 默认就是 `deep` 的。

# computed 和 autorun

## autorun

```js
import {observable, autorun} from 'mobx';

const val = observable([]);
const disposer = autorun(() => {
  console.log('update', val);
}, {
  onError(e) {
    console.log('错误捕获');
  },
  delay: 300, // 防抖， 300mm内执行一次
  scheduler: (cb) => cb() // 自定义调度，默认直接执行
});

val.push(0);  // update [0]
val.push(1);  // update [0, 1]

disposer(): // 取消监听

val.pop();  // 已经取消autorun的执行
```

## 区别

`computed`和`autorun`，都是当依赖`mobx`改变的时候执行`cb`，不过有以下区别：

- `computed`会产生一个新值, `autorun`不会产生新值
- `computed`只有在依赖的`mobx`改变的时候才会执行，而`autorun`无论新旧值是否一致，只要`update`就会执行

> 如果你有一个函数应该自动运行，但不会产生一个新的值，请使用`autorun`。 其余情况都应该使用 `computed`.

# observable 和 observer

`observer` 将 `React` 组件转换成响应式组件。

它用 `autorun` 包装了组件的 `render` ，所以每次 `render` 依赖的 `mobx state` 更新的时候都会刷新组件。

> `observer` 由 `mobx-react` 提供。

## observer 和 PureComponent

如果传递给组件的数据是 observable， 还能够防止组件 props 浅层 改变时的重新渲染。这个行为和 PureComponent 类似，如果组件提供 SCU，会被优先调用。

```js
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

// @observer
class Child extends React.Component {
  render() {
    const { list } = this.props;
    return (
      <ul>
        {list.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </ul>
    );
  }
}

@observer
class Container extends React.Component {
  @observable list = [];

  handleClick = () => {
    this.list.push(1);
  };

  render() {
    const { list } = this;
    return (
      <section>
        <button onClick={this.handleClick}>click me to update</button>
        {/* {list.map((item, index) => <p key={index}>{item}</p>)} */}
        <Child list={list} />
      </section>
    );
  }
}

export default Container;
```

以上代码，点击 `button` ，不会更新视图，因为即使 `list` 更新会引起 `container` 的 `render` 重新执行，但是得到 `elements` 之后 `React` 会进行浅层比较，因为 `list` 的索引依然没有变，索引不会去更新 `Child` 。

这个时候如果想让 `Child` 更新，可以把注释的代码取消注释。

因为 `list.map` 执行之后的 `elements` 和之前的 `elements` 不一样， `React` 会直接丢弃后面的元素不再进行比较，直接使用最新的 `elements` 去构建新的视图， `Child` 得以更新。

当然也可以把 `Child` 也编程 `observer` ，告诉 `mobx-react` ，这个组件依赖 `mobx state list`，这样，当 `list` 改变的时候， `proxy` 到，然后执行 `autorun` 就能够更新 `child` 了。

> 其实这里跟 React 自己的 setState 差不多，试想，如果`Container`在 setState 的时候，没有 `this.setState({list: ...list})`, 那 child 还是不会更新。

# 进度

[MobX 会对什么作出反应?](https://cn.mobx.js.org/best/react.html)

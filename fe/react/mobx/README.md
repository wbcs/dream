# mobx
这玩意儿跟Vue有点像，之前以为它跟redux差不多都是immutable，结果发现完全相反。

React自己要通过setState去更新，用了mobx自动对值进行proxy，再配合observer，就能够实现和Vue类似的改动state自动更新视图的效果了。

# 用法
```jsx
// 前者用来观察值，后者则负责改变值
// 修改mobx最好放在action中，
import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

const state = observable({
  counter: 0
});

const App = observer(props => {
  const { counter } = porps.state;
  
  const handleClick = action(() => state.counter++);
  return (
    <div>
      counter is : {counter},
      <button onClick={handleClick}>click me to increment counter's value.</button>
    </div>
  );
});

export default () => <App state={state} />;
```
这样就能实现一个非常简单的计数器。

函数式的方式显得有点冗余，结合es7的decorator进一步让代码清晰：
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
        <button
          onClick={handleClick}
        >
        click me to increment counter's value.
        </button>
      </div>
    );
  }
}

export default App;
```
简洁多了。

> action和action.bound的区别就是后者在调用前者的基础上又绑定了context

## decorator和函数调用的联系
+ @observable: observable.deep(其实就是observable，observable默认就是deep的
+ 

#
computed和autorun，都是当依赖mobx改变的时候执行cb，不过语义不一样，首先computed会产生一个新值，其次一般在computed中会有一些副操作。而autorun除了不会有新值。

而且computed会有一定的优化，依赖没变、其他mobx没有使用computed都不会重新执行computed。

# 进度
observalble相关刚刚弄完，明天看[对observable 做出响应](https://cn.mobx.js.org/refguide/computed-decorator.html).
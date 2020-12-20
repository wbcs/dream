# ref

首先来看一下在 class 和 function 组件中使用 ref 的区别：

```tsx
class App extends React.Component {
  ref = React.createRef(null);
  componentDidMount() {
    // this.ref.current
  }
  render() {
    return <div ref={ref}>this is a div</div>;
  }
}

const App: React.FC<{}> = () => {
  const ref = useRef(null);

  useEffect(() => {
    // ref.current
  }, []);

  return <div ref={ref}>this is a div</div>;
};
```

**其实 ref 就是组件生命周期内存放数据的容器。**

对于 class 组件来说，ref 就是一个绑定在组件实例上的一个对象而已，所以它可以在组件的生命周期内保存。而对于 function 组件来说，因为不存在实例的概念，所以丢失了像 class 组件那样在组件生命周期内存放（mutable）数据的能力。

因此才有了 `useRef` 来弥补函数组件在这方面的不足。

# callback ref

```tsx
const App: React.FC<{}> = () => {
  const ref = useCallback((element) => {
    // do something.
  }, []);

  return <div ref={ref}>this is a div</div>;
};
```

callback ref 会在 DOM 挂载和销毁的时候被调用。

```tsx
const App: React.FC<{}> = () => {
  const ref = useCallback((element) => {
    const clear = setTimeout(() => {
      // tick
    }, timer);
    // callback ref 并不支持.
    return () => clearTimeout(clear);
  }, []);

  return <div ref={ref}>this is a div</div>;
};
// 当组件被销毁的时候 element 会是 null

const Noop = () => {};
const App: React.FC<{}> = () => {
  const clearRef = useRef(Noop);
  const ref = useCallback((element) => {
    if (!element) {
      ref.current();
      return;
    }
    const clear = setTimeout(() => {
      // tick
    }, timer);
    clearRef.current = () => clearTimeout(clear);
    // callback ref 并不支持.
  }, []);

  return <div ref={ref}>this is a div</div>;
};

// 抽离出来
function useEffectRef(callback) {
  const clearRef = useRef(Noop);
  const effect = useCallback((element) => {
    clearRef.current();
    if (element) {
      const clear = callback(element);
      clearRef.current = clear;
    }
  }, []);

  return effect;
}

const App: React.FC<{}> = () => {
  const ref = useEffectRef(() => {
    const clear = setTimeout(() => {
      // tick
    }, timer);
    return () => clearTimeout(clear);
  });

  return <div ref={ref}>this is a div</div>;
};
```

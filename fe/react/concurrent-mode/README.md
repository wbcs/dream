# Concurrent Mode

快速响应：

- CPU 瓶颈：关键是 time slice，预留一点时间给浏览器做一些更具响应的事情（响应用户交互、给 UI 线程绘制的时间等），而实现 time slice 的关键是任务的更新是可打断和可恢复的。
- IO：web 的 IO 开销主要是网络延迟，但这部分开发人员是无法解决的。React 是将人机交互研究的结果整合到真实的 UI 中.
  > 对于需要 fetch 的交互，可以等到数据返回之后再跳转、刷新页面。当这个时间足够短的时候人是无感知的，如果超出某个阈值则展示 spinner 会更好一些。为此推出了 Suspense、lazy、useDeferredValue

要完成这两件事情，更新的过程需要被中断并且能够被恢复。

## 启用 Concurrent features

```tsx
import * as ReactDOM from 'react-dom';
import App from './App';

ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
```

|                                          | legacy 模式 | blocking 模式      | concurrent 模式 |
| ---------------------------------------- | ----------- | ------------------ | --------------- |
| String Refs                              | ✅          | 🚫                 | 🚫              |
| Legacy Context                           | ✅          | 🚫                 | 🚫              |
| findDOMNode                              | ✅          | 🚫                 | 🚫              |
| Suspense                                 | ✅          | ✅                 | ✅              |
| SuspenseList                             | 🚫          | ✅                 | ✅              |
| Suspense SSR + Hydration                 | 🚫          | ✅                 | ✅              |
| Progressive Hydration                    | 🚫          | ✅                 | ✅              |
| Selective Hydration                      | 🚫          | 🚫                 | ✅              |
| Cooperative Multitasking                 | 🚫          | 🚫                 | ✅              |
| Automatic batching of multiple setStates | 🚫          | ✅                 | ✅              |
| Priority-based Rendering                 | 🚫          | 🚫                 | ✅              |
| Interruptible Prerendering               | 🚫          | 🚫                 | ✅              |
| useTransition                            | 🚫          | 🚫                 | ✅              |
| useDeferredValue                         | 🚫          | 🚫                 | ✅              |
| Suspense Reveal “Train”                  | 🚫          | 🚫                 | ✅              |
| ReactDOM                                 | render      | createBlockingRoot | createRoot      |

## useTransition

这个 `API` 的存在是因为某些场景由于 state 改变 rerender 时的任务高度占用 CPU, 造成用户无法正常交互. `useTransition` 就是 `React` 通过一些方法, 根据本机 CPU 的计算能力来决定是否频繁地执行这些昂贵的操作.

```tsx
import { useState, useTransition } from 'react';

// 用户输入会很频繁 如果不做处理 列表页的渲染是相当耗费性能的
// 在计算能力低下的 CPU 会造成用户输入卡顿，影响用户体验
const Input = ({ onChange }: { onChange: (value: string) => void }) => {
  const [value, setValue] = useState('');

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
};

const App = () => {
  const [value, setValue] = useState('');
  const [isPending, startTransition] = useTransition();

  // 在 onChange 的时候 startTransition
  // 具体什么时候渲染列表页交由 React 觉得
  return (
    <section>
      <Input onChange={(value) => startTransition(() => setValue(value))} />
      isPending: {JSON.stringify(isPending)}
      <ul>
        {new Array(10000).fill(true).map((item, index) => (
          <li key={index}>
            {index}:{value}
          </li>
        ))}
      </ul>
    </section>
  );
};
```

> 为什么不用节流？<br />
> 在计算性能超高的计算机上，防抖这样的操作会比不做处理更慢，反而降低了用户体验。

## useDeferredValue

上面的例子也可以用 `useDeferredValue` 重写，可以达到类似的效果

```tsx
import { useState, useDeferredValue, useMemo } from 'react';

const App = () => {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value, { timeMs: 500 });

  // 在 onChange 的时候 startTransition
  // 具体什么时候渲染列表页交由 React 觉得
  return (
    <section>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      {useMemo(
        () => (
          <ul>
            {new Array(10000).fill(true).map((item, index) => (
              <li key={index}>
                {index}:{deferredValue}
              </li>
            ))}
          </ul>
        ),
        [deferredValue]
      )}
    </section>
  );
};
```

## render, commit, work

`Reconciler` 工作阶段被称为 `render` 阶段，因为这个过程会调用 render 方法得到 VNode。`renderer` 工作的阶段被称为 `commit` 阶段。`render` 和 `commit` 统称为 `work` 阶段，也就是 React 在工作，如果是 `scheduler` 在工作就不属于 work。

> render 可中断，commit 是不可中断的。

- 对于 v15 的 `Reconciler`
  - `Reconciler` 对 VNode 的比对和对 UI 的 `renderer` 是交替工作的。当 `Reconciler` 发现有需要更新的 VNode 时就告知 `renderer`，`renderer` 执行更新操作，然后递归更新子节点。
  - 这种模式是无法中断的。因为每次 `Reconciler` 比对完成后就会更新 UI，一旦终端 UI 就会是不完整的 UI
- v16 的 `Reconciler`
  - 引入 `scheduler` 的概念。`Reconciler` 和 `renderer` 不再交替工作，只有当整个 APP Tree 都 `Reconciler` 完毕后才会交由 `renderer` 去渲染。
  - 其中 `scheduler` 和 `Reconciler` 都是在内存中操作，即使被终端 UI 也不会是不完全的。
  - `Reconciler` 的工作是否需要被中断，则是由 `scheduler` 来判断的。
    > 双缓存技术在 React 中的实践其实是将当前构建的 UI 树 `workInProgress` 和当前 UI 已经渲染后的 UI 树 `currentFiber` 分为两颗树。两者交替交还身份，当 `renderer` 完成渲染后，`workInProgress` 就成了 `currentFiber`，`currentFiber` 就成了 `workInProgress` 供下次更新使用。两者通过 `alternate` 互相引用。

## lane

之前 React 一直是使用 expirationTime 来表示任务的优先级的。随着时间的流逝， expirationTime 和当前时间的 delta 越来越小，优先级便自动越来越高。

不过后来重构为 lane 模型:

- 有 batching 的概念，各个任务被划分到不同的分类
- 不一定优先级高的任务就必须先执行

优点：

- lane 将任务的 优先级 和 应该被处理的哪一批任务 分类
- lane 可以用单一 32 位表示许多不同任务

> 在 React 中， Suspense 中抛出 thenable 对象为 IO 任务。优先级较 CPU 高。

## Ref

- [Real world example: adding startTransition for slow renders](https://github.com/reactwg/react-18/discussions/65)
- [New feature: startTransition](https://github.com/reactwg/react-18/discussions/41)
- [浅入 React16/Fiber Part4 Concurrent Mode](https://zhuanlan.zhihu.com/p/82563945)

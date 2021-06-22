## CM

快速响应：

- CPU 瓶颈：关键是 time slice，预留一点时间给浏览器做一些更具响应的事情（响应用户交互、给 UI 线程绘制的时间等），而实现 time slice 的关键是任务的更新是可打断和可恢复的。
- IO：web 的 IO 开销主要是网络延迟，但这部分开发人员是无法解决的。React 是将人机交互研究的结果整合到真实的 UI 中.
  > 对于需要 fetch 的交互，可以等到数据返回之后再跳转、刷新页面。当这个时间足够短的时候人是无感知的，如果超出某个阈值则展示 spinner 会更好一些。为此推出了 Suspense、lazy、useDeferredValue

要完成这两件事情，更新的过程需要被中断并且能够被恢复。

```tsx
import { useState, useDeferredValue, lazy } from 'react';
import { createRoot } from 'react-dom';

function App() {
  const [text, setText] = useState('hello');

  // 最大不超过 timeoutMs 的延迟
  const deferredText = useDeferredValue(text, { timeoutMs: 5000 });

  return (
    <div className="App">
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Component text={deferredText} />
    </div>
  );
}

function Component({ text }: { text: string }) {
  return (
    <ul>
      {new Array(1000).fill(true).map((_, index) => (
        <li key={index}>{text}</li>
      ))}
    </ul>
  );
}

createRoot(document.querySelector('#root')).render(<App />);
```

- 对于 v15 的 `Reconciler`
  - `Reconciler` 对 VNode 的比对和对 UI 的 `renderer` 是交替工作的。当 `Reconciler` 发现有需要更新的 VNode 时就告知 `renderer`，`renderer` 执行更新操作，然后递归更新子节点。
  - 这种模式是无法中断的。因为每次 `Reconciler` 比对完成后就会更新 UI，一旦终端 UI 就会是不完整的 UI
- v16 的 `Reconciler`
  - 引入 `scheduler` 的概念。`Reconciler` 和 `renderer` 不再交替工作，只有当整个 APP Tree 都 `Reconciler` 完毕后才会交由 `renderer` 去渲染。
  - 其中 `scheduler` 和 `Reconciler` 都是在内存中操作，即使被终端 UI 也不会是不完全的。
  - `Reconciler` 的工作是否需要被中断，则是由 `scheduler` 来判断的。
    > 双缓存技术在 React 中的实践其实是将当前构建的 UI 树 `workInProgress` 和当前 UI 已经渲染后的 UI 树 `currentFiber` 分为两颗树。两者交替交还身份，当 `renderer` 完成渲染后，`workInProgress` 就成了 `currentFiber`，`currentFiber` 就成了 `workInProgress` 供下次更新使用。两者通过 `alternate` 互相引用。

`Reconciler` 工作阶段被称为 `render` 阶段，因为这个过程会调用 render 方法得到 VNode。`renderer` 工作的阶段被称为 `commit` 阶段。`render` 和 `commit` 统称为 `work` 阶段，也就是 React 在工作，如果是 `scheduler` 在工作就不属于 work。

> render 可中断，commit 是不可中断的。

## lane

之前 React 一直是使用 expirationTime 来表示任务的优先级的。随着时间的流逝， expirationTime 和当前时间的 delta 越来越小，优先级便自动越来越高。

不过后来重构为 lane 模型:

- 有 batching 的概念，各个任务被划分到不同的分类
- 不一定优先级高的任务就必须先执行

优点：

- lane 将任务的 优先级 和 应该被处理的哪一批任务 分类
- lane 可以用单一 32 位表示许多不同任务

> 在 React 中， Suspense 中抛出 thenable 对象为 IO 任务。优先级较 CPU 高。

### @TODO

- react-test

# start

[浅入 React16/Fiber Part4 Concurrent Mode](https://zhuanlan.zhihu.com/p/82563945)

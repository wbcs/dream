# createRoot

```js
const root = ReactDOM.unstable_createRoot(container);
```

## root.render

```js
const work = root.render(<Component />);

work.then(() => {
  console.log('over');
});
```

## root.createBatch

```js
const batch = root.createBatch();
batch.render(Component);
// 等到render完成执行相应的回调
batch.then(cb);

// 至于什么时候把虚拟DOM映射到真实的DOM上，取决于什么时候调用commit
batch.commit();
```

由 root.createBatch 创建的 batch 在 commit 的时候各自之间相互不会影响。

而且对于同一个 batch 的不同 render 能够实现批处理。

> batch 在完成时会调用 then 的回调，这个执行回调的过程是同步的。而执行 then 的时机取决于什么时候执行 commit，一旦一个 batch 被 commit 就会同步执行 then

## root.render 和 batch.render 的区别

root.render 在 flush 之后就会立即调用 work.then 的回调，这个时候 DOM 已经被更新。

```jsx
const root = ReactDOM.unstable_createRoot(document.querySelector('#root'));

const work = root.render(<App />);
// 等到then的cb执行的时候，log出来的root已经有children了
work.then(() => {
  const currentRoot = document.querySelector('#root');
  console.log(currentRoot);
});
```

而 batch.render 在 flush 之后必须要等到 batch.commit()之后才会将 change 映射到 DOM 上，执行 then 的回调。

```jsx
const root = ReactDOM.unstable_createRoot(document.querySeletor('#root'));
const batch = root.createBatch();
const work = batch.render(<App />);
// 等到then执行的时候log出来的root依然是原来未渲染App的DOM
batch.then(() => {
  const currentRoot = document.querySelector('#root');
  console.log(currentRoot);
});

// 如果想要拿到更新后的DOM，则必须调用commit
batch.then(() => {
  // commit执行过程是同步的
  batch.commit():
  const currentRoot = document.querySelector('#root');
  console.log(currentRoot);
});

work.then(() => {
  console.log('work complete');
});
```

完整的流程就是：

- root.render: `createRoot => root.render => sometimes call flush => component render => dom update => work.then`
- batch.render: `createRoot => root.createBatch => batch.render => somtimes call flush => component render => batch.then => call batch.commit at sometimes => dom update => work.then`

其中，commit 和 flush 都会渲染 component，如果 commit 的时候组件还未渲染，则立即（sync）渲染，否则跳过渲染的过程直接 update dom。完事儿之后 work.then。

调用 commit 会先执行 work.then 然后才执行 batch.then

> work.then 一定是组件渲染完毕并且更新到 DOM 上。而 batch.then 则是组件渲染完毕就会执行。而且如果同时存在 root.render()和 batch.render()以后者为准，不再去执行 root.render。在有多个 batch.render 的情况下，work.then 会在这些 batch 全部都 over 之后执行

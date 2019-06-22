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

由root.createBatch创建的batch在commit的时候各自之间相互不会影响。

而且对于同一个batch的不同render能够实现批处理。
> batch在完成时会调用then的回调，这个执行回调的过程是同步的。而执行then的时机取决于什么时候执行commit，一旦一个batch 被commit就会同步执行then

## root.render和 batch.render的区别
root.render在flush之后就会立即调用work.then的回调，这个时候DOM已经被更新。
```jsx
const root = ReactDOM.unstable_createRoot(document.querySelector('#root'));

const work = root.render(<App />);
// 等到then的cb执行的时候，log出来的root已经有children了
work.then(() => {
  const currentRoot = document.querySelector('#root');
  console.log(currentRoot);
});
```

而batch.render在flush之后必须要等到batch.commit()之后才会将change映射到DOM上，执行then的回调。
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
+ root.render: `createRoot => root.render => sometimes call flush => component render => dom update => work.then`
+ batch.render: `createRoot => root.createBatch => batch.render => somtimes call flush => component render => batch.then => call batch.commit at sometimes => dom update => work.then`

其中，commit和flush都会渲染component，如果commit的时候组件还未渲染，则立即（sync）渲染，否则跳过渲染的过程直接update dom。完事儿之后work.then。

调用commit会先执行work.then然后才执行batch.then

> work.then一定是组件渲染完毕并且更新到DOM上。而batch.then则是组件渲染完毕就会执行。而且如果同时存在root.render()和batch.render()以后者为准，不再去执行root.render。在有多个batch.render的情况下，work.then会在这些batch全部都over之后执行
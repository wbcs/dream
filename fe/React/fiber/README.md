# Fiber架构
引入Fiber的原因是为了优化React的渲染问题：从setState起到渲染视图无法中断，一直占用main线程导致动画、用户交互等出现卡顿。而Fiber的引入就是为了解决这个问题。

浏览器将GUI描绘、timer callback、event callback、js、request统统放在一起执行，只有执行完一件事之后才能执行下一件事。如果有多余的事件，浏览器会对js进行JIT、热代码优化，以及内部对reflow的一些优化。

简单理解就是，让浏览器休息好才能跑得快。

# 如何让代码断开重连？
以前React的执行都是原子操作，如何让浏览器休息呢？

React的jsx：组件化、标签化。
```html
<section>
  <header></header>
  <article></article>
  <footer></footer>
</section>
```
我们都知道jsx最后被babel编译为：`React.createElement(type, {props}, children)`, 而jsx又是嵌套的，势必会产生递归的代码，所以React16之前的调度器称为栈调度。那他就没办法被暂停重启，也就无法让代码断开重连。而且函数的递归还需要保存上下文、执行、pop等等。

而链表不需要保存上下文、push、pop等，性能要比递归好得多，所以React采用了链表。

React是个构建用户视图的框架，它内部有三层架构：
+ 虚拟DOM层：仅仅描述js对象和真实DOM的结构
+ 组件层：组件更新、ReactDOM.render、setState等。
+ 渲染层：又具体的宿主环境将虚拟DOM渲染为真实的视图。

1、3都无从下手，只能改变组件层了。

Fiber的结点有:
+ return: 父节点
+ subling: 右兄弟结点
+ child: 第一个children
> 通过这三个属性就能够将一颗树转换为链表了

# 确定更新的数量
React16之前都是从root或者setState的组件开始更新整个树，开发者能做的，只有在shouldComponentUpdate进行一些优化，避免一些无用的比较。

而React16将虚拟DOM转换为fiber，fiber再转换为DOM。

## 分片的原理
我们简答实现以下ReactDOM.render的过程，其中主要看fiber的分片思想。
```js
const queue = [];
ReactDOM.render = function(root, container) {
  queue.push(root);
  updateFiberAndView();
};
```
updateFiberAndView要实现的是分片，先用setTimeout模拟。
```js
let uid = 0;
function Fiber(VNode){
  if (VNode instanceof Fiber) {
    return VNode;
  }
  for(const i in VNode){
      this[i] = VNode[i];
  }
  this.uid = uid ++;
}
function updateFiberAndView() {
  const deadline = Date.now() + 100;
  updateView(); // 先不管这里具体实现
  // 因为上面的操作不可拆分，所以这里需要检查是否超时
  if (Date.now() < deadline) {
    let firstFiber;
    const visited = {};
    const VNode = queue.shift();
    let fiber = new Fiber(VNode);
    do {
      if (!firstFiber) {
        firstFiber = fiber;
      }
      if (!visited[fiber.uid]) {
        visited[fiber.uid] = true;
        // 这里可以理解为创建DOM或者更新DOM
        // 然后调用各种生命周期
        updateComponentOrElement(fiber);
        if (fiber.child) {
          if (Date.now() > deadline) {
            queue.push(fiber.child);
            break;
          }
          fiber = fiber.child;
          continue;
        }
      }
      if (fiber.sibling) {
        if (Date.now() > deadline) {
          queue.push(fiber.sibling);
          break;
        }
        fiber = fiber.sibling;
        continue;
      }
      fiber = fiber.return;
      if (fiber === firstFiber || !fiber) {
        break;
      } else if ((Date.now() > deadline) {
        queue.push(fiber.return);
        break;
      }
    } while(1);
  }
  if (queue.length) {
    setTimeout(updateFiberAndView, 50);
  }
}
```
所以分片的思想就是对root进行DFS，如果有时间把每个VNode都转换为对应的fiber并更新组件或元素，更新的过程是原子的，所以需要再次检查时间，如果时间不够就push到queue中，break出loop，给浏览器50mm去干别的事，完了继续这个过程。

而updateComponentOrElement大概就是：
```js
function updateComponentOrElement(fiber){
  const {type, stateNode, props} = fiber
  if(!stateNode){
      if(typeof type === "string"){
          fiber.stateNode = document.createElement(type)
      }else{
          const context = {}//暂时免去这个获取细节
          fiber.stateNode = new type(props, context)
      }
  }
  if(stateNode.render){
    //执行componentWillMount等钩子
    callLifeHooks(type);
    children = stateNode.render();
  }else{
    children = fiber.childen;
  }
  let prev = null;
  　//这里只是mount的实现，update时还需要一个oldChildren, 进行key匹配，重复利用已有节点
  children.forEach(child => {
    child.return = fiber;
    if (!prev) {
      fiber.child = child;
    } else {
      prev.sibling = child;
    }
    prev = child;
  });
}
```
这我也看不太懂，可能是原作者没写完吧。。。以后再说

# 调度确保流畅
上面的updateFiberAndView我们给了它100mm，给了浏览器50mm。但是有可能updateFiberAndView用不了100mm，浏览器50mm又不够用，就会造成页面不流畅的问题。

说起流畅，就想起一些API：
+ requestAnimationFrame
+ requestIdleCallback

这些API 的调用时机都是由浏览器（系统）决定的，可以保证和刷新频率一致。React看上了requestIdleCallback的功能，但是兼容性的问题，它最终没有直接使用这个API，而是降介处理使用hack的requestAnimationFrame来模拟的。
![](https://pic2.zhimg.com/v2-e1ba24e51c372e7c824bdf4df5a41555_r.jpg)

使用它改写后的updateFiberAndView：
```js

function updateFiberAndView(deadline) {
  // const deadline = Date.now() + 100;
  updateView(); // 先不管这里具体实现
  // 因为上面的操作不可拆分，所以这里需要检查是否超时
  if (deadline.timeRemaining() > 0) {
    let firstFiber;
    const visited = {};
    const VNode = queue.shift();
    let fiber = new Fiber(VNode);
    do {
      if (!firstFiber) {
        firstFiber = fiber;
      }
      if (!visited[fiber.uid]) {
        visited[fiber.uid] = true;
        // 这里可以理解为创建DOM或者更新DOM
        // 然后调用各种生命周期
        updateComponentOrElement(fiber);
        if (fiber.child) {
          if (deadline.timeRemaining() <= 0) {
            queue.push(fiber.child);
            break;
          }
          fiber = fiber.child;
          continue;
        }
      }
      if (fiber.sibling) {
        if (deadline.timeRemaining() <= 0) {
          queue.push(fiber.sibling);
          break;
        }
        fiber = fiber.sibling;
        continue;
      }
      fiber = fiber.return;
      if (fiber === firstFiber || !fiber) {
        break;
      } else if ((deadline.timeRemaining() <= 0) {
        queue.push(fiber.return);
        break;
      }
    } while(1);
  }
  if (queue.length) {
    requestIdleCallback(updateFiberAndView, {timeout: Date.now() + 100});
  }
}
```
OK, FIber分片的原理就是这些啦~\(≧▽≦)/~

# 总结
这仅仅说了fiber的思想、分片原理，具体过程比这复杂的多，有能力会继续研究下去。

参考（照抄）：就是把这篇文章变成了更易于自己理解的话，原文在这：

[React Fiber架构](https://zhuanlan.zhihu.com/p/37095662)
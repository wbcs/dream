# javascript 对象模型

ECMAScript 规范将所有对象定义为由字符串键值(那 symbol 也是吗？)映射到 property 属性的字典。
![](./assets/shapes-ICs.svg)

# 属性访问优化

## shapes

有很多 js 对象，他们的形状是类似的，就是：

```ts
const obj0 = {
  name: 'Bruce',
  identity: 'BAT MAN',
};

const obj1 = {
  name: 'clark',
  identity: 'Super man',
};
```

而且很多操作都是对类似对象取同一个属性。考虑到这一点，引擎会基于对象的结构/形状来对取得对象属性进行一些优化。

比如现在要读取`obj0.name`,引擎会先从 JSObject 中查找到对应的 key，然后返回其 value。那对象在内存又是如何存储的呢？我们都知道 js 的引用类型变量都是存储在堆上的，但其他的好像知道的很少，因为 js 不允许开发者直接访问内存。

那这些对象应不应该存储为 JSObject 的一部分，如果是形状完全相同的对象如果存储很多遍是不是有点浪费（因为相同的 key 存储了多遍）。因此，引擎将对象的 shape 分开存储。
![](./assets/shapes-ICs2.svg)

可以看到 shape 中存储了除过 value 以外的所有对象属性的信息，其中的 offset 则记录的对象的 value 在 JSObject 中的偏移量，这样就能根据这个 offset 去找到属性的值了。以后每个具有相同 shape 的对象都指向同一个 shape 实例，JSObject 当中只存储对应的 value 即可。
![](./assets/shapes-ICs3.svg)

这下只要对象的 shape 一样，不管有多少个对象，在内存当中都只把这个形状的信息存储一次，然后值分开存。

> 所有的 js 引擎都对 shape 进行了优化。关于`shapes`优化学术上叫做`hidden classes`；V8 叫做`Maps`；JSCore 叫做`Structures`；spiderMonkey 叫做`shapes`。

## transition 链和树

上面说道具有相同 shapes 的对象在内存中，值是一个 JSObject，其中存储了各个属性的值以及对应 shapes 实例的引用。对应的 key 则存储在 shapes 的实例之中。那么，如果我给对象新添一个属性怎么办呢？

在 JavaScript 引擎中，shapes 的组织形式是以链表来组织的。
![](./assets/shapes-ICs4.svg)
可以看到，每增加一个属性，对应的 JSObject 中增加对应属性的 value，然后将自己的 shape 指向新的 shape 即可。图中是新建了一个 shapes 的实例，不过其实不用完全摒弃掉之前的 shapes 实例，可以通过新增一个 shapes，这个实例仅存储我们多出来的属性即可，原先的属性还是从之前的 shapes 中去找，通过链表将这些个 shapes 的实例组织到一起，查找的时候遍历即可。
![](./assets/shapes-ICs5.svg)

但是还有问题，上面只是说我某个对象新添的了一个属性这么做没有问题，但是如果使用同一个 shapes 实例的多个 JSObject 分别新增了不同的 key，那怎么办？很简单，一样的部分还是和链表一样，对于不同的 key，新建多个，然后以树的形式组织起来，遍历由链表的遍历更改为树的遍历即可。
![](./assets/shapes-ICs6.svg)

> 上面的例子是从一个空对象开始的，但事实上 root 不一定是{},可以直接就是一个最小的交集 shape。

# inline caches

shapes 背后的主要动机是 ICs，看一下下面的操作：

```js
function getX(x) {
  return obj.x;
}
console.log(getX({ x: 0 }));
```

按照前面的做法，如果想要取到对象的 x 属性，引擎应该这么做：

根据对象的结构（shapes）找到 shapes 实例，然后遍历这个 shapes（有可能是多个，树），查找到 x 这个 key 对应的 property information，读取其中的 offset，然后在众多的 JSObjects 当中，根据 offset 从当前的 JSObject 得到我们想要的属性的 value。

在这个过程中

# 参考（照抄）

[[译] JavaScript 引擎基础：Shapes 和 Inline Caches](https://hijiangtao.github.io/2018/06/17/Shapes-ICs/)

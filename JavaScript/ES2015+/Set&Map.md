# ES5中的Set和Map
Set、Map和数组、对象相似，都是集合，区别在于Set中的元素是唯一的，而数组中的元素可以重复。如果程序很简单，的确可以用`Object`来模拟Set和Map，但是如果触碰到`Object`的某些限制，那这个方法就会很复杂。我们先来看一下在ES5中如何通过`Object`来模拟Set、Map：
```javascript
let map = Object.create(null);
map[5] = 'some value';
/**
 * 由于Object的key只能是String，所以数字5隐式转换为字符串'5'
 * 而且如果使用{}作为key，会被转换为[Object object]
 * 这样不同的{}标识的值却是同一个 
 */
map['5'];  //some value

let set = Object.create(null);
set['key'] = null; // 或者undefined
/** 
 * 条件为假
 * 而且这样的操作到底是检查key是否存在于set中
 * 还是说取键为key的值呢？
 * 而且如果set[[prototype]]中存在key的话也会对操作造成影响
 */
if(set['key']) {
	/ ...
}
```

由于使用`Object`模拟`Set、Map`存在诸多限制与不便，`ES6`中新增了一种有序（书上前面说有序，后面说无序，很矛盾。不过个人判断是有序，包括`Map`也是有序的）列表，其中含有一些**相互独立**的**非重复值**。

# Set
用法就不多说了，是个人都能看得懂API，直接上码：
```javascript
/**
 * 还可以给构造函数中传入数组进行初始化
 * 而且Set还会有自动去重的功能
 */
let set = new Set(/* [2, 3, 5] */);
set.add(/* 要增加的值 */); // 向set中添加元素。
set.size; // 目前set中的元素数量
set.has(/* 要检测的值 */); // 判断Set中是否存在某个值， Boolean
set.delete(/* 要删除的值 */);
set.clear();  // 干掉Set中所有的值
```
除了上面代码注释中提到的以外，`Set`构造函数还可以接收一切可迭代对象作为参数，数组、`Set、Map`都是可迭代的。

如果想要对Set中所有元素进行操作，可以使用同数组一样的方法：`forEach`。
Set的forEach和Array中的forEach几乎一样，只不过是回调函数的前两个参数有所区别：
```javascript
let arr = [];
arr.forEach(functino(item, index, arr) {
 // 即arr[index] === item
});
let set = new Set();
arr.forEach(functino(value, value, set) {
 // 不能直接通过set[value]来引用
});
```
可以看到，`Set`的`forEach`和数组唯一不同的就是，`Set`不存在索引，也就是键名（其实可以看做`Set`是键名与值是相等的一种特殊对象/数组）。
很多人可能不知道，`forEach`除了第一个`callback`参数以外，还有第二个参数，第二个参数就是`callback`中的`this`的指向(类似`call`的第一个参数)。不错，`Set`的第二个参数与数组完全一样，也是此意。

## Set和Object/Array的区别
+ 1. 在`Set`中，不会对值进行隐式转换，数字5和字符串'5'、{}和{}都是作为两个截然不同并且独立的存在(`JS`引擎内部通过`Object.is()`来检测两个值是否一直)。
+ 2. `Set`和数组一样都有forEach，唯一的区别就是`forEach`的第一个参数`callback`中的前两个值相同，可以理解成`Set`的`key`和`value`是一个东西。
+ 3. 在数组或者对象中，可以直接通过`key`（数组是`index`）来访问元素，但是`Set`中不行，如果需要可以将`Set`转换为数组(通过`Array.from(set)`或者`[...set]`)。

## Weak Set
`Weak Set`是一种特殊的`Set`，它与一般的`Set`的不同之处在于:
+ 1. `Weak Set`只能接收**非原始值**作为它的元素。
+ 2. `Weak Set`**不可迭代**
+ 3. `Weak Set`**不支持**`size、forEach、ckear`等属性，**只有**`add、has、delete`。
+ 4. `Weak Set`中保存的对象是**弱引用**。

> 其中最后一项最为重要，这意味着Weak Set中保存的对象不在JavaScript引擎的GC考虑之中。

# Map
如果说`Set`和`Array`很像的话，那么`Map`跟`Object`也很像（比喻的好挫，，凑合看吧）。
和`Set`一样，`Map`的元素也不会被隐式转换。

用法：
```JavaScript
let map = new Map();
// 也可以：
let _map = new Map([[key0, value0], [key1, value1]]);
map.set(/* 要添加的key */, /* 对应的value */);
map.get(/* 要获取的值对应的key */);
map.has(key);
map.delete(key);
map.clear(); // 同Set, 下同
map.size;
```
没错，`map`除了以上属性以外，跟`set`一样，也有`forEach`，参数跟数组的完全一样，具体用法就不说咯。

## Weak Map
相对的，Weak Map是特殊的Map，与一般的Map的区别如下：
+ 1. `Weak Map`是不可迭代对象。
+ 2. 不支持`forEach、size、clear`等属性，只支持`set、get、delete`。
+ 3. 只接受对象作为`key`，但是`value`没有这个限制。
+ 4. 作为`key` 的对象同`Weak Set`，是弱引用。

# Set和Map的区别
一般来说，Set集合常被用于检查对象中是否存在某个key，而Map用户获取已存的信息
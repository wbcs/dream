# web存储机制
可以实现web存储的，有以下方式：
1. Cookie
2. sessionStorage
3. localStorage
4. IndexDB

# 一、Cookie
回头再写

# 二、sessionStorage
## 用法
```javascript
sessionStorage.setItem(key, value); // 或者
sessionStorage.key = value;

sessionStorage.getItem(key);
sessionStorage.removeItem(key);

/** 
 *	可以通过length和key()遍历sessionStorage中的键值对
 */
 for(let i = 0; i < sessionStorage.length; i ++) {
 	let key = sessionStorage.key(i);
    sessionStorage.getItem(key);
 }
```
## 到期时间
`sessionStorage`存储特定于某个会话的数据，也就是说只能保持到浏览器标签关闭之前(如果浏览器有标签恢复功能的话也行)，标签关闭后就会失效;

## sessionStorage的限制
+ `sessionStorage`对象绑定于某个服务器会话，所有必须是一次真正的HTTP请求，本地文件不可使用(cookie也是，不过FF下的cookie不受影响)。
+ 存储在sessionStorage中的数据只能由最初给对象存储数据的页面访问到，所以多页面应用有限制。
+ `sessionStorage`大小的限制是因浏览器而异的。有的浏览器对`sessionStorage`的大小没有限制，不过大多主流浏览器都有2.5MB的限制，`IE8+`和`Opera`是5MB。

## 浏览器将数据写入到磁盘的差异
不同浏览器写入数据的方式不同，`FireFox`和`WebKit`实现的是**同步**写入，而`IE`实现的异步写入。所以设置数据和将数据实际写入`disk`是存在延迟的。

在IE8中可以强制把数据写入磁盘：设置数据之前使用`begin();`,在设置完成之后使用`commit();`

> `sessionStorage`主要用于会话的小段数据的存储，如果需要跨会话存储数据，那么`localStorage`更为合适。

# 三、localStorage
## 使用方法
```javascript
localStorage.setItem(key, value);
localStorage.key = value;
localSotrage.getItem(key);
localStorage.removeItem(key);
```

## storage事件
对`Storage`对象进行任何修改都会在`document`上触发`storage`事件。
>注意是`Storage`对象，也就是说无论是`sessionStorage、localStorage、globalStorage`都会触发`storage`事件。

```javascript
document.addEventListener('storage', callback, options);
```

其中`callback`的`event`有以下属性：
+ domain：发生变化的存储空间的域名
+ key：设置或者删除的`key`
+ newValue：`setItem`是新值，`removeItem`是`null`
+ oldValue：`key`被修改之前的值

> PS:这个事件在同一个浏览器中的不同Tab页面也会触发(可以借此实现跨页面通信)。

## 到期时间
和`sessionStorage`不同，`localStorage`的失效只有两种情况：
+ `JavaScript`手动调用`API`删除
+ 大小超过浏览器限制，被浏览器全部删除

## 限制
1. 同源策略的限制：要访问同一个`localStorage`页面必须来自同一个域名（子域名无效），必须满足同源策略。
2. 存储大小的限制：对`Web Storage`的限制因浏览器而异，一般来说，存储空间的大小限制是以`Origin`（协议、域名、端口）为单位的。也就是说每个`Origin`都有一个可以保存数据的空间。对于`localStorage`，大多数浏览器都会设置每个`Origin` 5MB的限制，`Chrome、Safari`是2.5MB。


# 四、IndexDB
`Indexed Database API`，简称为`IndexDB`。是在浏览器中保存结构化数据的一种数据库。它的设计思想是方便保存和读取`JavaScript`对象，同时还支持查询和搜索。`IndexDB`设计操作完全的**异步的**。

IndexDB不是关系型数据库，也就是说它存储的不是表，而是对象。

## 用法
```javascript
// Chrome必须传入第二个VERSION，是一个版本号，unsign long long
let request = indexedDB.open(YOUR_DATABASE, VERSION);

request.onupgradeneeded = function(e) {
	const DB = e.target.result;
    // 第二个参数对象，keyPath是主键名，autoIncrement意思就是主键是否自动递增。具体作用看下面。
    DB.createObjectStore(SOTRE_NAME, {keyPath: /* 主键名[string] */ [, autoIncrement: true]});
};

// 除了第一次需要用到onupgradeneeded以外，其他情况多用onsuccess
request.onsuccess = function(e) {
	const DB = e.target.result;
    // 第二个参数指定是读写还是只读（这里是读写），具体参数自己查，不说了
    const transaction = DB.transaction(STORE_NAME [, 'readwrite']).objectStore(STORE_NAME)；
    // add的参数必须是对象，如果在createObjectStore的时候autoIncrement为false，则此处还必须传入主键对应的值，也就是 add({primaryKey: [string|number], yourKey: yourValue});
    // 反之，如为true，则可以省略，primaryKey自动从0开始递增
    const client = transaction.add({yourKey: yourValue});
    // add只能新增数据，不能覆盖，如果需要重写，可以使用put
    // oncomplete获取不到get()取得的数据
    client.onsuccess = function(e) {
    	e.target.result;
    };
    
    client.onerror = function(e) {
    	console.error(e);
    };
    
    // get()、delete()只用传入对应的主键值即可，其余操作和add、put无差别
    // clear()会干掉所用数据。
    
    
    //以上操作均是知道key的前提下，如果需要遍历整个store中的数据，可以：
    
    const store = DB.transaction(STORENAME, 'readwrite').objectStore(STORE_NAME);
    
    const client = store.openCursor();
    
    client.onsuccess = function(e) {
    	const cursor = e.target.result;
        console.log(cursor && cursor.value);
        // 如果需要更新具体的值，修改value后调用curosr.update(value);
        cursor.continue(/* 这里可以是想要取到的值的主键，没有默认是下一项 */);
        // 与continue对应的是advance(count)向前移动count
        // 然后就会自动调用client上的onsuccess，如果到结尾，cursor为null
    }
};

request.onerror = function(e) {
    console.error(e);
};

```
# 缓存的分类

按照缓存的位置分类可以分为：
+ memeory cache
+ disk cache
+ service worker

按照失效策略分类：
+ Cache-Control
+ ETag
+ Max-age

> http协议头的那些字段都属于disk cache

# cache的优先级
分别是（由高到低，由上到下）：
+ service cache
+ memory cache
+ disk cache
+ network request

# 各种cache

## memory cache
顾名思义，内存中的缓存。几乎所有的网络请求资源都会被浏览器自动加到`memory cache`中。

### 过期时间
因为浏览器占用的内存不能无限扩大、缓存的数量多的原因，`memory cache`只能是短期存储。常规情况下，浏览器的`tab`关闭后，该次`memory cache`便失效（如果一个页面占用了超多的内存，很可能在`tab`没有关闭之前，之前的一些缓存就已经失效了）。

### 命中
`preloader`请求来的资源就会被放入`memory cache`，这种机制保证**相同类型**的标签，**`src`相同**的情况下只会请求一次资源。但是在匹配缓存的时候，除了会比较`src`之外，还会比较类型，一个作为`script`的缓存资源就不能被用在`image`类型的请求上，即使他们的`src`相同。

在从`memory cache`获取缓存内容的时候，浏览器会忽视`Max-age`，`no-cache`等头部配置。这是因为`memory cache`只是短期使用，大部分情况只有一次浏览，而`max-age=0`普遍被解读为“不要在下次浏览时使用”，所以和`memory cache`不冲突。（也可以强制不使用`memory cache`，设置`no-store`即可）。

## disk cache
又名`http cache`，顾名思义是存储在硬盘上的缓存，因此它是持久存储的，是实际存在于文件系统中的。并且它允许相同的资源在跨会话、跨站点的情况下使用（例如多个站点使用了同一张图片）。<br />
`disk cache`会根据`http`头部信息的各种字段来判定:
+ 哪些资源可以缓存，哪些不可；
+ 哪些资源仍然可用，哪些是过期需要重新请求。

当命中缓存之后，浏览器会从硬盘中读取资源，虽然速度比起`memory cache`慢了
一点，但相比网络请求还是快了很多的。我们平时所说的缓存大部分都是`disk cache`。
凡是存储都会面临容量增长的问题，`disk cache`也不例外。在`browser`自动清理的时候，会依据相应的算法对**最可能过时**的资源进行清理，因此是**一个一个**删除的。不过每个`browser`使用的算法不尽相同，这也是他们差异性的一个体现。

## service worker
上述的缓存策略以及缓存/读取/失效的动作都是由浏览器内部判断 & 进行的，我们只能设置响应头的某些字段来告诉浏览器，而不能自己操作。但`service worker`的出现，给予了我们另外一种更加灵活、直接的操作方式。它和`disk cache`一样，都是永久性缓存。

`Service Worker` 能够操作的缓存是有别于浏览器内部的 `memory cache` 或者 `disk cache` 的。

有两种情况`service worker`缓存的资源被删除：
+ 1. 手动调用API cache.delete(resource);
+ 2. 容量超出限制，被浏览器全部清空。

如果 `Service Worker` 没能命中缓存，一般情况会使用 `fetch()` 方法继续获取资源。这时候，浏览器就去 `memory cache` 或者 `disk cache` 进行下一次找缓存的工作了。

> 注意：经过 `Service Worker` 的 `fetch()` 方法获取的资源，即便它并没有命中 `Service Worker` 缓存，甚至实际走了网络请求，也会标注为 `from ServiceWorker`。也就是说`from ServiceWorker` 只表示请求通过了`Service Worker`，至于到底是命中了缓存，还是继续 `fetch()` 方法,光看这一条记录其实无从知晓。

## network request：

如果以上三个位置都没有可用的缓存，那么`Browser`会发起网络请求去获取资源。为了提升之后请求的缓存命中率，自然要把这个资源加到缓存中去：
+ 根据`http`头部相关字段（cache-control，pragma等）决定存入`disk cache`；
+ `memory cache`保存一份资源的引用，以备下次使用。（同一次会话中）；
+ 根据`service worker`中的`handler`决定是否存入`cache storage`（额外的缓存位置）；

## 几种缓存的对比

cache name|差异
-|-
memory cache|`memory cache` 是浏览器为了加快读取缓存速度而进行的自身的优化行为，不受开发者控制，也不受 `HTTP` 协议头的约束，算是一个黑盒。
disk cache|也叫 `HTTP cache` (它遵守 `HTTP` 协议头中的字段)。平时所说的强制缓存，对比缓存，以及 `Cache-Control` 等，也都归于此类。
Service Worker|`Service Worker` 是由开发者编写的额外的脚本，且缓存位置独立，出现也较晚，使用还不算太广泛。

max-age和no-cache的区别：
+ max-age到期是[should]重新重新验证
+ no-cache是[must]重新验证。

> 不过实际情况以浏览器实现为准，大部分情况下他们的行为是一致的。如果是`cache-control:max-age=0, must-revalidate` 和 `no-cache`就完全等价了。

# 具体请求过程
当浏览器要请求资源时：
+ 1. 调用 `Service Worker` 的 `fetch` 事件响应
+ 2. 查看 `memory cache`
+ 3. 查看 `disk cache`。这里又细分：
   + 如果有强制缓存且未失效，则使用强制缓存，不请求服务器。这时的状态码全部是 200。
   + 如果有强制缓存但已失效，使用对比缓存，比较后确定 304 还是 200
+ 4. 发送网络请求，等待网络响应
+ 5. 把响应内容存入 `disk cache` (如果 `HTTP` 头信息配置可以存的话)
+ 6. 把响应内容 的引用 存入 `memory cache` (无视 `HTTP` 头信息的配置)
+ 7. 把响应内容存入 `Service Worker` 的 Cache Storage (如果 `Service Worker` 的脚本调用了 `cache.put()`)
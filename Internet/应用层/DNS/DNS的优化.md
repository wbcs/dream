# 优化

在[DNS](./DNS.md)中可以知道，从浏览器的缓存中读取是最快的，浏览器不仅仅要分析你键入的`URL`，而且遇到资源的链接时也会进行`DNS`解析。

而在这个过程中，要进行：

- 排队
- DNS
- 连接初始化
- SSL
- 发起请求
- TTFB
- 资源下载完毕等过程。
  ![](https://pic4.zhimg.com/80/v2-3921784e163d074a1c146e97309d7ce7_hd.jpg)

得到资源后还要由`byte=>char=>token=>node=>DOM`这样的过程，在解析过程中遇到外链资源又去`DNS`请求资源是比较低效的。如果能直接告诉浏览器本页面有哪些资源是需要下载的，让浏览器提前去`DNS`就更好了。

> `preload`是浏览器对下载到的`HTML`进行一个粗略的扫描（并没有去构建`DOM`）获取到需要`preload`的资源的`URL`和`type`。（具体在哪个过程我也不知道，个人猜测在由二进制转为字符后就可以进行这个过程了）。

具体方法是：

```html
<link ref="dns-prefetch" href="source.com" />
```

如果是`HTTPS`，可能还希望提前把`SSL`握手之类的也给做了：

```html
<link ref="preconnect" href="source.com" />
```

![](https://pic3.zhimg.com/v2-58e08d102b094ea5e873079bfb95e716_r.jpg)

> 一般两者都写，因为`preconnection`的兼容性不好。

关于`DNS`的优化就写到这吧，有补充会加入进来。另外其他整体优化的东西会新出一个目录去记录 📝。

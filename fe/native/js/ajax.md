# 写在前面的话

本文就是对`ajax`方面的知识做一个总结，没有什么深入的地方。虽然总结的文章有很多，但是看自己写的和看别人的文章感觉终究还是相去甚远的。所以如果读者觉得内容重复请直接右上角。

<hr />

# xhr & fetch

用法：

```javascript
let xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if ((xhr.status >= 200) & (xhr.status < 300) || xhr.status === 304) {
    }
  }
};
xhr.open('GET', 'http://localhost:8080', true);
// 如果是POST请求，则send的参数是具体的数据
xhr.send(null);
```

## xhr 上的事件：（省略前缀 on）

- `readystatechange`：每当`xhr.readyState`改变时触发。
- `timeout`：当请求发出超过`xhr.timeout`设置的时间后，依然没有收到响应，则会触发。如果在超时终止请求之后再调用访问`status`等属性就会导致错误，所以最好在`onreadystatechange`事件中使用`try-catch`。
- `loadstart`：收到响应`1byte`后触发。
- `progress`：其`event.tartget === xhr`，`event.lengthComputable`表示进度信息是否可用，`event.total：Content-Lengt`的预期字节数。`event.loaded：`已接收的字节数。（需要服务器返回`Content-Length`头部，否则`lengthComputable`一直为`false`）。
- `error`：请求出错触发。
- `abort`：`xhr.abort();` 终止连接时触发。
- `load`：接受到完整数据时触发，相当于 readyState === 4 时
- `loadend`：通信完成，不管是`error、abort`或者`load`，都会导致此事件的触发（没有浏览器实现）。

> ps: 为确保兼容性、正常执行，`onreadystatechange、progress`最好在`open`之前绑定。

## xhr 上的属性：

- `responseText`：作为响应主体被返回的文本
- `responseXML`：如果返回类型是`"text/xml" || "application/xml"` 则这个属性保存这`XML DOM`文档。否则为`null`。
- `status`：`http`状态码
- `statusText`：状态码的说明
- `readyState`：取值如下：
  - 0：未初始化，未调用`open()`;
  - 1：已初始化，调用了`open()`;
  - 2：发送。`send()`;
  - 3：接收。已接收到部分响应。
  - 4：完成，全部 over~
    需要注意的是，每当`readyState`变化的时候都会触发`onreadystatechange`事件，而且这个事件最好在`open`之前就绑定（为了兼容性）。
- `timeout`：超时时间(ms)。

## xhr 上的方法：

- `abort`：用于取消异步请求。
- `setRequestHeader(key, value)`：`open()`后`send()`前调用。
- `getResponseHeader/getAllResponseHeaders`：看名字，不解释了。
- `overrideMinmeType`：重写`xhr`响应的`MIME`（最好在`send`之前调用，这样可以确保绝对有效）。

### 误区：

并不是所有的事件都是异步的， xhr.onreadystatechange 和 xhr.onloadstart 就是同步事件。

```javascript
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => console.log('ready state change');
xhr.onloadstart = () => console.log('load start');
xhr.open(method, url);
xhr.send();
console.log('sync');
// 所以结果为 ready state change => load start => sync
```

# fetch

用法：

```javascript
/**
 * 此处的request、response见下文
 */
fetch(request)
  .then((response) => {
    response.json().then((data) => console.log(data));
  })
  .catch((err) => console.log(err));
```

### Request

可以通过`new Request();`创建`request`对象（当然也可以直接写）

```javascript
let request = new Request('http://localhost:8080', {
  // headers见下文
  headers,
  method: 'GET',
  mode: 'cors',
});
```

`request`上的方法：

- `method`： 支持`GET`,`POST`,`PUT`,`DELETE`,`HEAD`
- `url`：请求的 `URL`
- `headers`： 对应的`Headers`对象
- `referrer`： 请求的 `referrer` 信息
- `mode`： 可以设置`cors`,`no-cors`,`same-origin`
- `credentials`： 设置 `cookies` 是否随请求一起发送。可以设置:`omit`,`same-origin`
- `redirect`：`follow`,`error`,`manual`
- `integrity`： `subresource` 完整性值(`integrity value`)
- `cache`： 设置 `cache` 模式 (`default`,`reload`,`no-cache`)

### headers

可以通过`new Header();` 来创建请求头：

```javaScript
let headers = new Headers({'Content-Type': 'text/plain'});
headers.append('accept', 'text/*');
```

定义在 Headers 之上的一些方法如下：

![](https://user-gold-cdn.xitu.io/2018/11/6/166e90051dbfb814?w=362&h=428&f=png&s=46577)

### Response

`fetch().then(response);`中的`response`就是一个`Response`对象
可以通过`new Request();`创建`request`对象

- `clone()`： 创建一个新的 `Response` 克隆对象.
- `error()`： 返回一个新的,与网络错误相关的 `Response` 对象.
- `redirect()`： 重定向,使用新的 `URL` 创建新的 `response` 对象..
- `arrayBuffer()`： Returns a promise that resolves with an ArrayBuffer.
- `blob()`： 返回一个 `promise`, `resolves` 是一个 `Blob`.
- `formData()`： 返回一个 `promise`, `resolves` 是一个 `FormData` 对象.
- `json()`： 返回一个 `promise`, `resolves` 是一个 `JSON` 对象.
- `text()`： 返回一个 `promise`, `resolves` 是一个 `USVString (text)`.

# 跨域

## 同源策略

### 什么是同源？

**同源**就是拥有相同的`协议(protocol) && 主机(hostname) && 端口(port)`，那么这两个页面称为同源。一切非同源的请求均为跨域。并跨域无法随意请求，只是说为了网站的安全性，浏览器才采取同源策略。

如果是协议和端口造成的跨域问题，前端是无能为力的。
跨域问题中的域，浏览器只是用`url`首部来区分的，并不会对`DNS`之后得到的`IP`进行判断。

> ps：url 首部 = protocol + host；

严格的说，浏览器并不是拒绝所有的跨域请求，实际上拒绝的是跨域的读操作。浏览器的同源限制策略是这样执行的：

- 通常浏览器允许进行跨域写操作（Cross-origin writes），如链接，重定向；
- 通常浏览器允许跨域资源嵌入（Cross-origin embedding），如 img、script 标签；
- 通常浏览器不允许跨域读操作（Cross-origin reads）。

同源策略呢，限制了以下行为：

- `Cookie、LocalStorage、IndexDB`
- 浏览器中不同域的框架之间是不能进行`js`的交互操作
- `ajax`请求发不出去(其实可以发出去，只不过浏览器将响应给拦截了)

跨域方式：`JSONP、CORS、postMessage等`。

## 一、JSONP

`JSONP，JSON with Padding 参数式JSON`。
`JSONP`的原理其实就是利用了`<script>`标签的`src`引入外部脚本时不受同源策略的限制，通过手动添加`DOM`并赋予`src`请求的`url`，在请求的`url`中填写接收数据的回调，再加上服务器对`callback`的支持即可。

## 二、CORS

`Cross-Origin Resource Sharing, CORS 跨域资源共享`。`CORS`是一种`web` 浏览器的技术规范，它为`web` 服务器定义了一种允许从不同域访问其资源的方式。而这种跨域访问是被同源策略所禁止的。`CORS`系统定义了一种浏览器和服务器交互的方式来确定是否允许跨域请求， 有更大的灵活性，比起简单地允许这些操作来说更加安全。
`CORS`需要浏览器和服务器共同配合、支持。整个`CORS`通信过程都是由浏览器来完成的，除了一些限制以外，代码和普通的`ajax`没有什么不同，实现`CORS`的关键是服务器，只要服务器支持、实现了`CORS`接口就能实现`CORS`。

### 简单请求（simple request）和非简单请求（not-so-simple request）

满足以下两大条件的请求就是`simple request`：

- 1. Request method 是以下三种方法之一的：
  - HEAD
  - GET
  - POST
- 2. Http 头部信息只能(没有 Access-Control-Allow-Origin 的前提下)是以下几种：
     - Accept
     - Accept-Language
     - Content-Language
     - Content-Type: oneOf['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']
     - Last-Event-ID
       浏览器对简单请求和非简单请求的处理是不一样的。

#### ① 简单请求

对于简单请求（以下都是跨域情况）浏览器直接发出 CORS, 增加一个 Origin 头部。

![](https://user-gold-cdn.xitu.io/2018/11/6/166e90db4ec539ff?w=394&h=324&f=png&s=35856)

这个`Origin`字段作用是告诉服务器，本次跨域请求是源自哪个主机、端口、协议，服务器以此来判断是否允许此次跨域。

如果`Origin`不在服务器的许可范围内，那服务器就返回正常的`HTTP`响应。浏览器发现响应的`Access-Control-Allow-Origin`和发起请求的源不相等，或者根本没有这个字段，则浏览器拒绝此次请求。会被`xhr`的`onerror`事件捕获，这种错误无法通过状态码识别。

![](https://user-gold-cdn.xitu.io/2018/11/6/166e90e50d90af4d?w=352&h=200&f=png&s=21433)

否则服务器返回的响应会多出（所谓多出，其实就是浏览器设置了这些头部）等头部信息。

![](https://user-gold-cdn.xitu.io/2018/11/6/166e90e7795a2438?w=382&h=228&f=png&s=26749)

可以看到多出了`'Access-Control-Allow-Credentials'、'Access-Control-Allow-Headers'`等头部，这些头部具体意义见下文。

##### Access-Control-Allow-Origin

服务器必须设置的值，否则不能实现 CORS，它的值要么是精确的请求的 Origin，要么是通配符*（在需要 Cookie 的时候不支持*）。

##### Access-Control-Allow-Credentials

可选。意为是否允许发送`cookie`，默认为不允许，不过这个字段只能设置为`true`。如果浏览器不允许发送`cookie`，删除该字段即可。
注意：浏览器在请求的时候也必须设置：`xhr.withCredentials = true`;不过有的浏览器省略还会自动带上`cookie`，可以手动关闭。

##### Access-Control-Allow-Headers

可选。在`CORS`中，用于设置浏览器可以发送的头部。

```javascript
res.setHeader('Access-Control-Allow-Headers', 'Your-Fucking-Header');
```

##### Access-Control-Expose-Headers

可选。`CORS`返回请求的时候，`xhr.getAllResponseHeaders();`只能拿到 6 个基本头部字段：`'Cache-Control'、'Content-Language'、'Content-Type'、'Expires'、'Last-Modified'、'Pragma'`。通过`res.setHeader('Access-Control-Expose-Headers', 'some headers');`可以获得允许的`header`。

#### ② 非简单请求

非简单请求指的是那种对服务器有特殊要求的请求，如：`request method`是`put、delete`，或者`Content-Type`为`application/json`等。
非简单请求的`CORS`请求会在正式通信之前进行一次 HTTP 查询请求，称之为 **预检**请求（`preflight`）。浏览器先询问服务器，当发送方的域名在服务器允许之列，并且发送方使用的头部、请求方法都是服务器允许的时候才会发送正式的`Ajax`请求，否则报错。

非简单请求除了`Origin`以外，还会发送两个特殊的头部：`'Access-Control-Request-Method'，'Access-Control-Request-Headers'`。

##### Access-Control-Request-Method

浏览器此次 CORS 会用到的 HTTP 方法。

##### Access-Control-Request-Headers

指出浏览器会发送的额外的头部

![](https://user-gold-cdn.xitu.io/2018/11/6/166e916a82de7552?w=366&h=306&f=png&s=34650)
浏览器根据服务器返回的`'Access-Control-Allow-Origin'`和`'Access-Control-Allow-Headers'`来判断服务器是否允许`CORS`，除此之外还有以下头部：

##### Access-Control-Allow-Methods

必需。值由','分割的`String`，意为支持的`CORS`请求方法，返回的是所有支持的方法，不是浏览器设置的那个方法，避免多次`preflight`。

##### Access-Control-Max-Age

可选。单位： s（秒）。意为本次`preflight`的有效时间。在有效时间内不用再次发送预检请求，即允许缓存该回应。

#### CORS 用到的 HTTP 头部

| Headers                          | Server | Browser |
| -------------------------------- | ------ | ------- |
| Access-Control-Allow-Orgin       | √      | ×       |
| Access-Control-Allow-Headers     | √      | ×       |
| Access-Control-Allow-Methods     | √      | ×       |
| Access-Control-Max-Age           | √      | ×       |
| Access-Control-Allow-Credentials | √      | √       |
| Access-Control-Expose-Headers    | √      | ×       |
| Access-Control-Request-Method    | ×      | √       |
| Access-Control-Request-Headers   | ×      | √       |

### CORS 与 JSONP 的比较

| --    | 目的 | 支持方法           | 优势                                                                                 | 不足                                                                                                                                                                                                                          |
| ----- | ---- | ------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CORS  | 跨域 | 所有 HTTP 请求方法 | 请求方法不仅仅局限于 GET，支持所有 HTTP 请求方法。安全性高。                         | 老版本浏览器不支持 CORS，有一定兼容性问题，比如 IE10 及更早版本、Safari4 及更早版本、FireFox3.5 及更早版本都不支持。                                                                                                          |
| JSONP | 跨域 | GET                | 可以向老式、不支持 CORS 的网站请求数据。而且设置简单，无需设置过多的响应、请求头部。 | ① 只能支持 GET 方法 <br /> ② 对于存在恶意行为的服务器存在一定的安全隐患。<br /> ③ 需要一个接收数据的全局函数，污染了全局作用域。<br /> ④ 判断请求是否失败不容易（H5 给 script 新增 error 事件，但是等浏览器实现还需以时日）。 |

## 其它的一些跨域方法（感觉没 diao 用）

#### ①document.domain

如果两个网页的主域名相同，这个时候可以令`document.domain`都为其主域名（`document.domain`只能将其设置为自身和更高一级的父域名）。
由于同源限制的第二条，不同域的`iframe`之间不能进行`js`交互。所以通过`iframe.contentWindow`获取到的`window`对象，它的方法和属性几乎都是不可用的，并且不允许获取此`window.document`。
<br />这个时候：

```javascript
document.domain = /* 两个页面共同的父级域名 */；
```

然后就可以得到`iframe.contentWindow`的属性了。也可以通过`iframe`里面的方法请求数据，以此也可以达到跨域的目的。

#### ②location.hash

它的原理是父窗口可以对`iframe`的`URL`进行读写，而和祖先窗口（不仅仅是父窗口）同源`iframe`也可以读写父窗口的`URL`，而`hash`部分不会发送到服务器（不会产生`http`请求），所以可以通过修改`hash`来实现双向的通信。
具体操作是：<br />
`super`窗口中有一个跨域的`iframe0`，<br /> `iframe0`中又有一个和`super`同源的`iframe1`。<br />
如图所示，颜色表示是否同源。

![](https://user-gold-cdn.xitu.io/2018/11/6/166e91c63ce17892?w=586&h=410&f=png&s=16391)

- 1. `iframe0`想要发送数据的时候，可以直接修改`iframe1`的`hash`（跨域也可以）
- 2. `iframe1`监听`onhashchange`事件，拿到`hash`部分后，再修改`super`的`hash`（因为`iframe1`和`super`同源，所以可以）
- 3. `super`也监听`onhashchange`事件，就可以拿到数据了。
     代码如下：

```html
super：
<iframe id="iframe" src="http://localhost:8080/iframe0.html"></iframe>
<script type="text/javascript">
  let counter = 0;
  let url = 'http://localhost:8080/iframe0.html#';
  const iframe = document.getElementById('iframe');
  window.onhashchange = function (event) {
    console.log('_我得到数据:', event.newURL.split('#')[1]);
  };
</script>

iframe0：
<iframe src="http://localhost/iframe1.html" frameborder="0"></iframe>
<script>
  let counter = 0;
  let url = 'http://localhost/iframe1.html#';
  const iframe = document.querySelector('iframe');
  setInterval(() => {
    console.log('我发送数据：', +counter);
    iframe.src = url + counter++;
  }, 2000);
</script>

iframe1：
<script>
  window.onhashchange = function () {
    let data = event.newURL.split('#')[1];
    // 修改super的hash
    window.parent.parent.location.hash = data;
  };
</script>
```

结果：
![](https://user-gold-cdn.xitu.io/2018/11/6/166e92038d3257a2?w=850&h=704&f=gif&s=680848)

#### ④postMessage

要使用`postMessage`这个`API`必须要有其他窗口的引用`otherWindow`
发送方：

```javascript
otherWindow.postMessage(data, targetOrigin, [transfer]);
```

参数说明：

- `data`：发送的数据
- `targetOrigin`：指定哪些窗口接收消息，\*表示任何窗口， '/'表示当前域下的窗口。
- `transfer`：可选，和`message`同时传递的对象，这些对象的所有权被转移给消息的接收方，而发送方不再拥有所有权。

接收方：

```javascript
window.addEventListener(
  'message',
  (e) => {
    console.log(e);
  },
  false
);
```

在`e`中有 4 个属性比较重要：

- `data`：发送来的消息对象
- `type`：发送消息的类型
- `source`：发送消息的`window`
- `origin`：发送消息的`origin`
  直接通过给`e.source`添加引用类型的属性，可以直接给发送端的`window`添加数据。

# 总结

其实比较常用的跨域方法就是 CORS、JSONP，其他的有个大概了解知道就好了。其他的关于 XSS、CSRF 等内容回头待续。

# 参考

[正确面对跨域，别慌](https://juejin.im/post/5a2f92c65188253e2470f16d)
<br />
[fetch 简介: 新一代 Ajax API](https://blog.csdn.net/renfufei/article/details/51494396)
<br />
[ajax 跨域，这应该是最全的解决方案了](https://juejin.im/entry/5a379a7b5188252b145b269e)

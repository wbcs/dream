# axios.request
好像所有的方法都是用request封装而成的。
```js
class Axios {
  constructor(insConfig) {
    this.defaults = insConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }
  request(config = {}, ...args) {
    // axios.request('get', {});
    if (typeof config === 'string') {
      args[0].url = config;
      config = args[0];
    }
    config = {
      ...this.defaults,
      ...config,
    };
    config.method = config.method
      ? config.method.toLowerCase()
      : 'get';

    // 分别是真正请求数据的cb，null是因为fulfilled和reject总是成对出现
    const works = [dispatchRequest, null];
    const promise = Promise.resolve(config);
    this.interceptors.request.forEach(interceptor => {
      if (!interceptor) return;
      works.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    this.interceptors.response.forEach(interceptor => {
      if (!interceptor) return;
      works.push(interceptor.fulfilled, interceptor.rejected);
    });
    // dispatchRequest之前的都是对request的拦截
    // dispatchRequest之后都是对response的拦截
    while (works.length) {
      promise = promise.then(works.shift(), works.shift());
    }
    // 最后的这个promise，只有等到最后一个res拦截resolve了，才会执行
    return promise;
  }
}
```
`request` 通过把 `interceptor` 的 `request` 放在 `dispatchRequest` 之前， `response` 放在之后，然后从头开始，依次将 `config` 流过每个 `request` ,然后到达 `dispatchRequest` 。

得到结果后， 又将 `res` 依次流过每个 `response interceptor`。这样就实现了对请求、响应的拦截。

## interceptors
```js
axios.interceptors.request.use(fullfilled, rejected);
axios.interceptors.response.use(fullfilled, rejected);
```
> `request` 注册的 `callback` 以 `stack` 顺序执行

> `response` 以 `queue` 顺序执行
```js
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  use(fulfilled, rejected) {
    this.handlers.unshift({
      fulfilled,
      rejected,
    });
    // 以其index作为key
    return this.handlers.length - 1;
  }
  eject(index) {
    if (!this.handlers[index]) return;
    this.handlers[index] = null;
  }
}
```


# dispatchRequest
真正发送请求的部分。node使用http，浏览器使用xhr。

defaults.adapter为默认的请求部分，先来看一下（node回头有时间了再看吧）。
## adapter
```js
function adapter(config) {
  return new Promise((resolve, reject) => {
    const { data: requestData } = config;
    const { headers: requestHeaders } = config;

    // 如果是FormData，干掉头部，让浏览器自己去设置
    if (typeof FormData !== 'undefined' && requestData instanceof FormData) {
      delete headers['Content-Type'];
    }

    let request = new XMLHttpRequest();
    request.open(config.method.toUpperCase(), buildURL(
      config.url,
      config.params,
      config.paramsSerializer
    ), true);

    request.timeout = config.timeout;
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    request.onreadystatechange = function handleReadyStateChange() {
      if (!request || request.readyState !== 4) return;


    };

    request.ontimeout = function handleTimeout() {
      if (!request) return;

      request = null;
    };

    request.onabort = function handleAbort() {
      if (!xhr) return;
      reject(new Error('abort'));
      xhr = null;
    };

    if (typeof config.onDownloadProgress === 'function') {
      request.onprogress = config.onDownloadProgress;
    }



  });
}
```

# tips
## 如何取消请求，以及何时会触发onabort，浏览器取消和手动取消请求如何区分？
取消请求的情况：
+ 超时浏览器自动取消
+ 链接跳转浏览器自动取消：这种情况只在 `Chrome` 奏效 `IE、Firefox` 不会触发 `onabort` ，但是会触发 `onreadystatechange` 事件。
+ `xhr.abort();`

怎么判断是浏览器取消，还是手动取消呢？

两者都会调用 `onabort` 事件，区别是手动取消 `xhr` 的各种属性已经被清掉（ `status、readystate` 都为0），而浏览器触发 `onabort` 时，这些属性依然存在。

`JQuery` 中是通过 `xhr.statusText = 'abort'`, 这样如果是 `abort` 则是手动取消， 浏览器取消，则 `statusText` 会是 `timeout`。

> `fetch` 目前没有取消请求对应的 `API` ， 所以暂时不能取消。还有一点，就是 `xhr` 无论是请求成功与否都可以取消，但是 `fetch` (自己封装 `promise` 实现取消)成功之后就不能取消了。
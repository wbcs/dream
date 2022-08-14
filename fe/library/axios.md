# 前言

axios 文档我都没看过，都是跟着感觉瞎玩的，什么对请求、响应的拦截好奇他是咋写的。

# axios.request

好像所有的方法都是用 `request` 封装而成的。

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
    config.method = config.method ? config.method.toLowerCase() : 'get';

    // 分别是真正请求数据的cb，null是因为fulfilled和reject总是成对出现
    const works = [dispatchRequest, null];
    const promise = Promise.resolve(config);
    this.interceptors.request.forEach((interceptor) => {
      if (!interceptor) return;
      works.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    this.interceptors.response.forEach((interceptor) => {
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
// 都是传入一对
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

真正发送请求的部分。 `node` 使用 `http` ，浏览器使用 `xhr` 。

`defaults.adapter` 为默认的请求部分，先来看一下（ `node` 回头有时间了再看吧）。

## adapter 之 xhr

```js
function xhr(config) {
  return new Promise((resolve, reject) => {
    const { data: requestData = null } = config;
    const { headers: requestHeaders } = config;

    // 如果是FormData，干掉头部，让浏览器自己去设置
    if (typeof FormData !== 'undefined' && requestData instanceof FormData) {
      delete headers['Content-Type'];
    }

    let request = new XMLHttpRequest();

    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      config.headers.Authorization = `Baisc ${btoa(`${username}:${password}`)}`;
    }

    request.open(
      config.method.toUpperCase(),
      buildURL(config.url, config.params, config.paramsSerializer),
      true
    );

    request.timeout = config.timeout;

    request.onreadystatechange = function handleReadyStateChange() {
      if (!request || request.readyState !== 4) return;
      // status为0，没有responseURL，或者responseURL为file://
      if (
        request.status === 0 ||
        !request.responseURL ||
        request.responseURL.indexOf('file:') === 0
      ) {
        return;
      }
      // 没有responseType返回或者responseType是text都返回responseText
      const responseData =
        !config.responseType || config.responseType === 'text'
          ? request.responseText
          : request.response;

      // getAllResponseHeaders返回的是string，需要手动解析
      const responseHeaders =
        'getAllResponseHeaders' in request
          ? parseHeaders(request.getAllResponseHeaders())
          : null;
      // 在进一步判断返回、状态码后决定是resolve还是reject
      setttle(resolve, reject, {
        headers: responseHeaders,
        status: request.status,
        statusText: request.statusText,
        data: responseData,
        config,
        xhr: request,
      });
      request = null;
    };

    request.onabort = function handleAbort() {
      // 这里需要判断，可能是因为onabort会重复触发吧？
      if (!request) return;
      reject(new Error('abort'));
      request = null;
    };

    request.onerror = function handleError() {
      reject(new Error('error'));
      request = null;
    };

    request.ontimeout = function handleTimeout() {
      reject(new Error('timeout'));
      request = null;
    };

    /**
     *   这里还涉及了对xsrf header的设置
     *   只有标准浏览器支持，暂时略过
     */

    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // 如果为空，则默认为text
    if (config.responseType) {
      // 给同步的xhr设置responseType会丢出一个InvalidAccessError异常
      try {
        request.responseType = config.responseType;
      } catch (e) {
        /**
         *  浏览器引发的预期domException与xmlhttpRequest级别2不兼容。
         *  但是，对于“json”类型，这可以被禁止，因为它可以由默认的“transformResponse”函数解析。
         */
        if (config.responseTpe !== 'json') {
          throw e;
        }
      }
    }

    if (typeof config.onProgress === 'function') {
      request.addEventListener('progress', config.onProgress);
    }
    // 不是所有的浏览器都支持上传进度
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if ('setRequestHeader' in request) {
      requestHeaders.forEach((header) => {
        if (!requestData && header.toLowerCase() === 'content-type') {
          delete requestHeaders[header];
        } else {
          request.setRequestHeader(header, requestHeaders[header]);
        }
      });
    }

    if (config.cancelToken) {
      // 取消操作，暂时略过，回头再详写
    }

    request.send(requestData);
  });
}
```

ok, axios 关于如何发起请求的部分大概就这么多了，除了添加 xsrf headers 和取消的部分。

# tips

## 如何取消请求，以及何时会触发 onabort，浏览器取消和手动取消请求如何区分？

取消请求的情况：

- 超时浏览器自动取消
- 链接跳转浏览器自动取消：这种情况只在 `Chrome` 奏效 `IE、Firefox` 不会触发 `onabort` ，但是会触发 `onreadystatechange` 事件。
- `xhr.abort();`

怎么判断是浏览器取消，还是手动取消呢？

两者都会调用 `onabort` 事件，区别是手动取消 `xhr` 的各种属性已经被清掉（ `status、readystate` 都为 0），而浏览器触发 `onabort` 时，这些属性依然存在。

`JQuery` 中是通过 `xhr.statusText = 'abort'`, 这样如果是 `abort` 则是手动取消， 浏览器取消，则 `statusText` 会是 `timeout`。

> `fetch` 目前没有取消请求对应的 `API` ， 所以暂时不能取消。还有一点，就是 `xhr` 无论是请求成功与否都可以取消，但是 `fetch` (自己封装 `promise` 实现取消)成功之后就不能取消了。

# 总结

学到的点：

- `request.getAllResponseHeaders`返回的是纯`string`，需要手动`split`
- 设置`token`：`headers.Authorization = 'Basic ' + btoa(username + ':' + password);`
- `content-type`：
  - 如果没有数据要传送，最好干掉这个头部
  - 如果传输的数据的 `formData` ，也干掉这个头部让浏览器去设置
- 除了`progress`，有的浏览器还支持上传进度`request.upload.onprogress`
- 手动取消请求和浏览器取消的情况的区别
- `fetch` 和 `xhr` 的区别，以及以 `promise` 实现 `fetch` 的类库和真正的 `fetch` 之间的差距

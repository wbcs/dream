# JSON的原理
原理很简单，利用`script`标签`src`不受*同源策略*限制，`server`把`data`传入全局函数中返回即可。
> `JSONP`, `JSON Padding` 也就是内联的`JSON`

# 实现
```js
class JSONP {
  _queue = [];
  status = 'unsend';
  callbackName = 'callback';
  script = document.createElement('script');
  callback;
  ontimeout;
  _clear;
  constructor(options) {
    this._init(options);

    window[this.callbackName] = (json) => {
      try {
        const { cb } = options;
        clearTimeout(this._clear);
        this.status = 'fullfilled';
        cb(json);
      } catch (e) {
        console.error('err:', e);
      }
    };
  }
  _init({ url, cb, timeout }) {
    const { callbackName } = this;

    this.callback = cb;
    this.timeout = timeout;
    this.requestURL = this._parseURL(url, callbackName);
  }
  _parseURL(url, name) {
    const hasQueryString  = url.includes('?');
    const [queryStr] = url.split('#');

    if (!hasQueryString) {
      return `${queryStr}?callback=${name}`;
    }
    return `${queryStr}&callback=${name}`;
  }
  send() {
    const { status } = this;
    if (status === 'pending' || status === 'fullfilled') return;

    this.status = 'pending';
    const { script, requestURL, _queue } = this;
    _queue.push(() => {
      script.src = requestURL;
      document.head.appendChild(script);
      this._listenToTimeout();
    });
    Promise.resolve().then(() => {``
      _queue.forEach(fn => {
        try {
          fn();
        } catch (e) {
          console.error(e);
        }
      });
    });
  }
  abort() {
    if (this.status === 'unsend' || this.status === 'rejected') return;
    const { callbackName } = this;
    this.status = 'rejected';
    this._queue = [];
    window[callbackName] = null;
  }
  _listenToTimeout() {
    const { timeout } = this;
    if (typeof timeout !== 'number') return;
    this._clear = setTimeout(() => {
      if (typeof this.ontimeout === 'function') {
        this.abort();
        this.ontimeout();
      }
    }, timeout);
  }
}

const jsonp = new JSONP({
  url: 'http://localhost:8080?a=1&&&',
  cb: (data) => {
    console.log(data);
  },
});

jsonp.send();
```

# 服务端
```js
const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  const { callback } = parseParams(req.url);
  if (!callback) {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
    });
    res.end('{}');
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/script',
    });
    const data = { temp: '123' };
    const resData = `${callback}(${JSON.stringify(data)})`;
    res.end(resData);
  }
});

server.on('listening', () => {
  console.log('server listening on prot', 8080);
});

server.listen(8080);

function parseParams(url) {
  const index = url.indexOf('?');
  if (index === -1) return {};
  return querystring.parse(url.slice(index + 1));
}
```

# ws

使用 ws 就不能直接和 express 监听统一端口了：

```js
const ws = require('ws');
const wsServer = new ws.Server({
  port: 3000,
});
wsServer.on('connection', (socket) => {
  socket.on('message', (msg) => {
    // some action
  });
});
```

那如要想根据路径来使用 websocket，需要配合 express-ws 这个库，于是学习了一下。

# express-ws

简单思路就是改写 app 的 listen 方法，然后手动创建一个 HTTP server，进行一个中间层的处理：

```js
const ws = require('ws');
const http = require('http');

function expressWs(target) {
  const server = http.createServer(target);

  // 代理到server上
  target.listen = function (...args) {
    server.listen(...args);
  };
  // 给app添加ws方法
  addWsMethod(target);

  const wsServer = new ws.Server({ server });
  wsServer.on('connection', (socket, req) => {
    req.ws = socket;
    req.wsHandled = false;

    const dummyResponse = new http.ServerResponse(req);
    dummyResponse.writeHead = function (statusCode) {
      if (statusCode > 200) {
        socket.close();
      }
    };
    target.handle(req, dummyResponse, () => {
      if (!req.wsHandled) {
        socket.close();
      }
    });
  });
  return {
    getWss: () => wsServer,
  };
}
function addWsMethod(target) {
  if (target.ws) return;
  // 支持和app.get一样的middleware
  target.ws = function (route, ...middlewares) {
    const wrappedMiddleware = middlewares.map(wrapMiddlewares);
    // 修改一下路径
    const wsRoute = websocketURL(route);
    // 最后监听的依然还是在get这里，只不过对应的url的路径后面都加了.websocket而已
    target.get(...[wsRoute].concat(wrappedMiddlewares));
  };
}
function wrapMiddlewares(middleware) {
  return (req, res, next) => {
    if (req.ws) {
      try {
        req.wsHandled = true;
        // 注意这里传入的是req.ws
        middleware(req.ws, req, next);
      } catch (e) {
        next(e);
      }
    } else {
      next(req, res, next);
    }
  };
}
function websocketURL(route) {
  if (route.inludes('?')) {
    const [baseURL, query] = route.split('?');
    return `${trailingSlash(baseURL)}.websocket?${query}`;
  }
  return `${trailingSlash(route)}.websocket`;
}

const app = express();
const wsServer = expressWs(app);
```

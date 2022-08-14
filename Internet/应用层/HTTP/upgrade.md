# HTTP 升级

http 协议提供了一种机制，允许将一个已经建立的连接升级成新的、不相容的协议。通常升级请求方是 client，不过也可以是 server（由 server 发起升级到 TLS），client 可以选择是否要升级到新协议。

> 借助这种机制，能够把 HTTP1.1 升级到 HTTP2 或者 websocket。

# 升级的具体过程

协议的升级请求总是 client 发起，暂时没有 server 请求协议更改的机制（那 TLS 不算吗）。client 发送一个普通请求（get/post），不过这个普通请求需要两个额外的 header：

```http
Connection: Upgrade
Upgrade: websocket
```

Connection 指明当前请求是一个升级请求。Updrade 指定一个或多个协议名，按照优先级排序，以逗号分隔。

服务器收到这个升级请求之后，决定是否升级此次链接。<br />
如果升级则会返回一个 `101 Switching Protocols`，响应头会包含 `Upgrade: protocol-name`。<br />
如果不升级此次连接，则直接忽略 `Upgrade` 字段，返回正常的响应即可（比如 `200 OK` ）。

> 可以使用 `HTTP1.1` 升级到 `HTTP2` ，但是不能用其他方式，而且 `HTTP2` 没有升级机制，所以 `HTTP2` 完全不支持 `101` 状态码。

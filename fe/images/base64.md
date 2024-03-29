`data:{mimeType};base64,{code}`

# 流行原因

早期 `HTTP` 不支持 `keep-alive` ,每发起一次 `HTTP` 请求就要建立 `TCP` 链接。

后来随着 `HTTP1.1` 新增 `keep-alive` 保存 `TCP` 链接，虽然减少了建立 `TCP` 链接的开销，但是 `HTTP` 这种面向文本的协议对消息的处理必须是串行的，得有序逐个解析。

所以发起 `HTTP` 的成本较高，这种方式才得以流行。

但是随着 `HTTP2` 的普及，在 `HTTP1.1` 的 `keep-alive` 的前提下又新增了分帧、请求-响应可以交错、复用，实现了对多个请求的并行处理， `HTTP` 的开销已经大大降低了，所以 base64 这种方式就变得有些鸡肋了。

# 缺点

- 大小：base64 编码要比图片本身大 30%左右
- 缓存无法工作：都是 inline 的编码无法使用缓存
- 如果在 css 文件中，还会导致 css 体积增大，下载时间增长，延迟阻塞页面渲染的时间
- 不方便调试：图片都是编码，无法在 dev tool 中预览
- 低版本浏览器不兼容

# video
实习的这段时间有用到video做一个很小的播放、暂停、展示等工作，用js去手动控制视频的播放、暂停，我就在想既然有用到，那就下去深挖一下，看看video有哪些有意思的地方。

# 常用配置
关于video的属性一大堆，自己去百度就行了，这里只罗列一些最常用的。

## `<video>`上的属性
```html
<video
  src=""
  controls
  autoplay
  loop
  
>
  <!-- 用source来置顶多个文件，为浏览器提供可支持的编码格式 -->
  <source src="" type="" />
  <source src="" type="" />
  浏览器不支持video时显示
</video>
```
## video对象上的属性
+ readyState: 视频当前的就绪状态
+ preload: 预加载，值有：none,auto(只缓冲音频),metadata(缓冲文件元数据)
+ buffered: 已缓存部分的TimeRanges对象
+ currentTime: 当前的播放位置(秒)
+ duration: 长度(秒)
+ ended: 是否播放结束
+ loop: 是否循环播放
+ muted: 是否关闭声音
+ defaultMuted: 默认是否静音
+ volume: 设置/返回音量
+ playbackRate: 设置/返回播放速度

## video对象上的方法
+ play(): 播放
+ pause(): 暂停
+ load(): 重新加载视频
+ canPlayType(): 传入'video/type'，只要不返回空string，即支持该类型。

## 事件
+ onplay:
+ onpause:
+ onended: 视频播放完毕时触发
+ ontimeupdate: 

## 终止媒体下载
`video.pause();`只能暂停播放，浏览器依然会继续下载媒体，直到`video`被干掉。想要终止下载，有以下两种方法：

```javascript
video.pause();
video.src  = '';
// 或者
video.removeAttribute('src');
```

# video预览本地视频
未完待续
https://chimee.org/docs/index.html
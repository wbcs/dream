# 获取视频首帧图片

```js
const video = document.querySelector('video')

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
canvas.width = video.clientWidth
canvas.height = video.clientHeight
context.drawImage(video, 0, 0, canvas.width, canvas.height)

canvas.toBlob(
  (blob) => {
    const file = new File([blob], 'image.png')
  },
  'image.png',
  1
)
```

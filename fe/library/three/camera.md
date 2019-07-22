# camera
三要素之一，有两种`camera`：
+ 正交投影`camera`：`new THREE.PerspectiveCamera();`
+ 透视投影`camera`：new 

区别：**正交投影camera**渲染出来的图形无论远近大小一样；**透视投影**则跟人类视角类似，近大远小。

# 透视投影camera
这种camera更接近现实：
```js
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far, zoom);
// camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
```

![](https://user-gold-cdn.xitu.io/2019/3/27/169be0b2fa6404ab?w=1730&h=1086&f=png&s=797328)

> 但是我在使用的时候，fov其实是zoom，zoom实际不存在.也就是：`new THREE.PerspectiveCamera(zoom, aspect, near, far);`

![](https://user-gold-cdn.xitu.io/2019/3/27/169be0f07330efdc?w=1618&h=1282&f=png&s=123606)

## 正交投影camera
在使用这种camera的时候，由于渲染物体的大小都是一样的，所以不关心什么长宽比，只需要一个被渲染的方块区域即可。
```js
const camera = new THREE.OrthoGraphicCamera(
  left,
  right,
  top,
  bottom,
  near,
  far
);
// this.camera = new THREE.OrthographicCamera(
//   window.innerWidth / - 16,
//   window.innerWidth / 16,
//   window.innerHeight / 16,
//   window.innerHeight / -16,
//   -200,
//   500
// );
```

![](https://user-gold-cdn.xitu.io/2019/3/27/169be1d093f4df66?w=1108&h=760&f=png&s=179023)

# 改变camera的视角
按住鼠标。可以拖动视角，，有点卡
```js
componentDidMount() {
  const cb = (e) => {
    requestAnimationFrame(() => {
      this.handleMouseMove(e);
    });
  };
  window.addEventListener('mousedown', (e) => {
    this.position.x = e.pageX;
    this.position.Y = e.pageY;
    window.addEventListener('mousemove', cb);
  });
  window.addEventListener('mouseup', () => window.removeEventListener('mousemove', cb));
}
handleMouseMove(e) {
  this.changeCamera(this.camera, {
    x: e.pageX,
    y: e.pageY
  }, this.position);
}
changeCamera(obj, pos, prevPos) {
  let {cameraParams} = this;
  const {scene, camera, renderer} = this;
  const x = pos.x - prevPos.x;
  const y = pos.y - prevPos.y;
  if (x > 0) {
    cameraParams.counter0 += .3;
  } else if (x < 0) {
    cameraParams.counter0 -= .3;
  }
  if (y > 0) {
    cameraParams.counter1 -= .3;
  } else if (y < 0) {
    cameraParams.counter1 += .3;
  }
  obj.lookAt(new THREE.Vector3(cameraParams.counter0, cameraParams.counter1, 0))
  prevPos.x = pos.x;
  prevPos.y = pos.y;
  renderer.render(scene, camera);
}
```
# 啥是three.js
其实我老早之前就想自己写一款游戏了，但是如果要使用原生的WebGL或者canvas来做的话，目前我的水平还不够。而这个three.js就是可以忽略掉底层细节，直接关注逻辑来开发3D动画效果的JavaScript库。

# 最基本的三要素
提到WebGL，最基本的三要素：
+ scene: 场景，你所看到的一切都可以看做是保存在这个场景中的元素。
+ camera: 摄像机，就是看scene的视角，不同的视角看同一场景，得到的效果也是不一样的。
+ renderer: 渲染器，将看到的画面渲染到canvas之中。

# 第一个demo
这种东西说太多也没屌用，自己跟着实现一边就差不多懂了基本概念。这里就不写原生了，我们直接使用react和THREE相结合：
```jsx
import React from 'react';
import THREE from 'three.js';

class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.sceneRef = React.createRef();
  }
  componentDidMount() {
    const {sceneRef, renderer} = this;
    sceneRef.current.appendChild(renderer.domElement);  // 这看代码都能懂
  }
  render() {
    const {sceneRef} = this;
    // 最终的结果肯定是要渲染到DOM中的，本例就渲染在scene这个div上吧。
    return (
      <div id="scene" ref={sceneRef} />
    );
  }
}

export default Scene;
```

刚刚提到最基本的三要素，要创建一个3D效果，肯定是先要创建以上三要素的：
```jsx
constructor() {
  super(props);
  // 所有的东西都是在THREE这个对象上的。
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.renderer = new THREE.WebGLRenderer();

  
}
```

好了，准备工作完成了，现在我们给这个空白场景里添加东东：
```jsx
componentDidMount() {
  const {scene, camera, renderer, webgl} = this;
  // 设置背景颜色，画布大小
  renderer.setClearColor(0xEEEEEE);
  renderer.setSize(window.innerWidth, window.innerHeight);

  this.addPlane();  // 添加一个平面

  // 设置camera的位置
  camera.position.x = -30;
  camera.position.y = 40;
  camera.position.z = 30;
  camera.lookAt(scene.position);

  webgl.current.appendChild(renderer.domElement);
  this.renderSence();
}
addPlane() {
  const {scene, things} = this;
  const planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xcccccc
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = - Math.PI / 2;
  plane.position.x = 15;
  plane.position.y = 0;
  plane.position.z = 0;
  plane.receiveShadow = true;
  scene.add(plane);
  things.plane = plane;
}
```
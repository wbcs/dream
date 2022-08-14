# 网格的创建

有了几何体和材料之后，将其合二为一就成为了一个网格对象，也就是一个 object，最后 renderer 就可以了。

```js
const geometry = new THREE.BoxGeometry(5, 5, 5);
const material = new THREE.MeshLambertMaterial({
  color: 0xffffff * Math.random(),
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
```

# mesh 的属性

## 自定义形状

如果想要创建自定义的几何体，那就得自己确定一系列的点，然后合成为面，组成几何体即可：

```js
const vertices = [
  new THREE.Vector3(x, y, z),
  ...,
  new THREE.Vector3(x, y, z),
];
// 点的顺序是顺时针则面对camera，就能看见，否则就相当于cf中卡到bug中，都是透明的那样
const faces = [
  new THREE.Face3(a, b, c), // abc的范围是 0 ~ vertices.length - 1
  ...,
  new THREE.Face3(a, b, c),
];
const geometry = new THREE.Geometry();
geometry.vertices = vertices;
geometry.faces = faces;
// geometry.verticesNeedUpdate = true; 如果需要在点改变的时候更新面的话。设置为true
geometry.computeFaceNormals();
```

## clone

mesh 跟 geometry 都有 clone 方法，前者可以直接 add 到 scene 中，后者添加材料后 add：

```js
const newGeometry = geometry.clone();
const materials = [
  new THREE.MeshBasicMaterial({}),
  new THREE.MeshLambertMaterial({}),
];
const newMesh = THREE.SceneUtils.createMultiMaterialObject(
  newGeometry,
  materials
);
scene.add(newMesh);
```

> 这也是创建带线的物体的一种方法。

另一种方法是：

```js
const helper = new THREE.WireframeHelper(mesh, lineColor);
scenen.add(helper);
```

## 属性

![](https://user-gold-cdn.xitu.io/2019/3/27/169bdf3d5a6e4502?w=1730&h=730&f=png&s=466153)

比如要移动位置：

```js
cube.position.x = 10;
cube.position.x = 3;
cube.position.x = 1;
// 也可以
cube.position.set(10, 3, 1);
// 也可以
cube.position = new THREE.Vertor3(10, 3, 1);
```

旋转：

```js
cube.rotation.x = Math.PI / 2;
cube.rotation.set(Math.PI / 2, 0, 0);
cube.rotation = new THREE.Vertor3(Math.PI / 2, 0, 0);
```

缩放：scale 大于 1 就放大。小于缩小

改变相对位置：

```js
cube.translateX(4);
cube.translateY(4);
cube.translateZ(4);
```

# 结束

关于网格的一些基础东西暂时就写到这，以后学到新的再来补充 👍。

附带一个常用的转动物体的代码：

```js
handleMouseMove(e) {
  this.changeCamera(
    this.scene.getObjectByName('cube'),
    { x: e.pageX, y: e.pageY },
    this.position
  );
}
  rotate(obj, pos, prevPos) {
    const {scene, camera, renderer} = this;
    const x = pos.x - prevPos.x;
    const y = pos.y - prevPos.y;
    if (x > 0) {
      obj.rotation.y += 0.01;
    } else if (x < 0) {
      obj.rotation.y -= 0.01;
    }
    if (y > 0 && obj.rotation.x <= Math.PI / 2) {
      obj.rotation.x += 0.01;
    } else if (y < 0 && obj.rotation.x >= -Math.PI / 2) {
      obj.rotation.x -= 0.01;
    }
    prevPos.x = pos.x;
    prevPos.y = pos.y;
    renderer.render(scene, camera);
  }
```

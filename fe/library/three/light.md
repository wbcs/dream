# 光源预览
![](https://user-gold-cdn.xitu.io/2019/3/28/169c3e8f98c869e0?w=1748&h=816&f=png&s=621669)

# THREE.AmbientLight
> Ambient: 环境

特点：
+ 不产生阴影，对所有物体都渲染颜色，可以理解为能照射到任何地方的光源

```js
const ambientLight = new THREE.AmbientLight(0x0c0c0c);
scene.add(ambient);
```

# THREE.PointLight
同样，点光源也不产生阴影。从原点向所有方向都发射光线。

![](https://user-gold-cdn.xitu.io/2019/3/29/169c89ee4e19d81f?w=1732&h=492&f=png&s=261194)

```js
const pointLight = new THREE.PointLight(color);
pointLight.position.set(x, y, z);
scene.add(pointLight);
```

# THREE.SpotLigth
类似于手电筒的光。能够产生阴影。

![](https://user-gold-cdn.xitu.io/2019/3/29/169c8a162424a164?w=1754&h=1048&f=png&s=735693)

![](https://user-gold-cdn.xitu.io/2019/3/29/169c8a18f7eed2a1?w=1758&h=964&f=png&s=785921)

```js
const spotLight = new THREE.SpotLight(color);
spotLight.castShadow = true;
// 聚光灯除了位置，还需要指定照射的点
spotLight.position.set(x, y, z);
spotLight.target = target;
// 如果不想把光源照射到某一个特定的对象，可以将target设置为一个点
spotLight.target = new THREE.Object3D();
spotLight.target.position = new THREE.Vector3(x, y, z);

scene.add(spotLight);
```
> 要使用阴影效果时，确保投射阴影的对象设置`castShadow`属性，显示阴影的对象设置`receiveShadow`属性。
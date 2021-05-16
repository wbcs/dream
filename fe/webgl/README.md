## 基本用法

```js
const gl = canvas.getContext('webgl');
```

缓冲区：

- 颜色缓冲区 `gl.clearColor(r ,g ,b ,a)`, gl.COLOC_BUFFER_BIT
- 深度缓冲区 `gl.clearDepth(depth)`, gl.DEPTH_BUFFER_BIT
- 模板缓冲区 `gl.clearStencil(s)`, gl.STENCIL_BUFFER_BIT

## shader

着色器分为两种：

- 定点着色器: vertex shader, 用来某个顶点的描述位置和颜色
- 片元着色器: fragment shader，用来描述光照

- vec4(): 四个浮点数的向量
- main(): 和 C 类似，入口函数
- `vec4 gl_Position`: keyword，表示位置的四维浮点数向量
- `float gl_PointSize`: keyword, 表示绘制曲线宽度的浮点数
- `vec4 gl_FragColor`: keyword, 表示片源的颜色

```js
const sourceCode = `
void main() {}
`;
const program = gl.createProgram();
const shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(shader, sourceCode);
gl.compilerShader(shader);
gl.touchShader(program, shader);

gl.linkProgram(program);
gl.useProgram(program);
```

## buffer

`gl.vertexAttrib3fv` 每次只能画一个点，buffer 就是允许我们一次性将多个点传递给着色器

```js
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // 将 buffer 绑定到 顶点着色器的缓冲区
// 将数据写入和 gl.ARRAY_BUFFER 绑定的 buffer
// 因为我们不能直接向 buffer 里写数据
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]), // 3个点的坐标
  gl.STATIC_DRAW // 一次性传递数据，多次绘制
);
gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(attribLocation);

gl.drawArrays(gl.POINTS, 0, 3); // 三个点
gl.drawArrays(gl.TRIANGLES, 0, 3); // 实心三角形
gl.drawArrays(gl.LINE_LOOP, 0, 3); // 空心三角形
```

### 绘制一个点的着色器代码：

我们绘制一个，光斑跟随鼠标移动，并且颜色随机变化的一段 webgl 程序：

```js
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const program = gl.createProgram();
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vertexShader,
  `
attribute float a_size;
attribute vec4 a_position;

void main() {
  gl_PointSize = a_size;
  gl_Position = a_position;
}
`
);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  fragmentShader,
  `
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`
);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);
gl.useProgram(program);

const aSize = gl.getAttribLocation(program, 'a_size');
const aPostion = gl.getAttribLocation(program, 'a_position');
const uColor = gl.getUniformLocation(program, 'u_color');

gl.clearColor(0, 0, 0, 1);
gl.vertexAttrib1f(aSize, 5);

const points = [];
window.addEventListener('mousemove', (e) => {
  const { clientWidth, clientHeight } = document.documentElement;
  const x = (2 * e.clientX - clientWidth) / clientWidth;
  const y = -(2 * e.clientY - clientHeight) / clientHeight;
  points.push({
    x,
    y,
    rgb: [Math.random(), Math.random(), Math.random()],
  });
  if (points.length >= 10) {
    points.shift();
  }
  gl.clear(gl.COLOR_BUFFER_BIT);

  points.forEach((item, index) => {
    gl.vertexAttrib3fv(aPostion, new Float32Array([item.x, item.y, 0]));
    gl.uniform4fv(uColor, new Float32Array([...item.rgb, 1]));
    gl.drawArrays(gl.POINTS, 0, 1);
  });
});
```

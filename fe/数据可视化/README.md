## 基本用法

```js
const gl = canvas.getContext('webgl');
```

缓冲区：

- 颜色缓冲区 `gl.clearColor(r ,g ,b ,a)`, gl.COLOC_BUFFER_BIT
- 深度缓冲区 `gl.clearDepth(depth)`, gl.DEPTH_BUFFER_BIT
- 模板缓冲区 `gl.clearStencil(s)`, gl.STENCIL_BUFFER_BIT

## 着色器

着色器分为两种：

- 定点着色器: vertex shader, 用来某个顶点的描述位置和颜色
- 片元着色器: fragment shader，用来描述光照

- vec4(): 四个浮点数的向量
- main(): 和 C 类似，入口函数
- `vec4 gl_Position`: keyword，表示位置的四维浮点数向量
- `float gl_PointSize`: keyword, 表示绘制曲线宽度的浮点数
- `vec4 gl_FragColor`: keyword, 表示片源的颜色

### 绘制一个点的着色器代码：

```js
main();

function main() {
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl');
  const vertexShaderSource = `
    void main() {
      gl_Position = vec4(1.0, 1.0, 0.0, 1.0);
      gl_PointSize = 10.0;
    }
  `;

  const fragmentShaderSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

  initShader(gl, vertexShaderSource, fragmentShaderSource);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
}
```

### 使用 attribute

要将数据从 js 传递到着色器程序中，有两种变量可以做到：

- attribute: 顶点相关的数据
- uniform: 所有顶点都相同的数据

```js
// ...

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
      gl_Position = a_position;
      gl_PointSize = 10.0;
    }
  `;

initShader(gl, vertexShaderSource, fragmentShaderSource);

const a_position = gl.getAttributeLocation(gl.program, 'a_position');
if (a_position < 0) {
  throw new Error('get attribute location error');
}
// 3f => 3 个 float
// 这里的 3 指的是 3 个矢量
gl.vertexAttrib3f(a_position, 1, 1, 0);

// ...
```

> 在 main 之外声明好 `attribute vec4` 变量，初始化 shader 之后将值从 js 传递到 ES 中，然后绘制

类似的，除了 vec4 还可以是其他类型的变量

```js
const source = `
attribute float a_size;
void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  // gl_PointSize = 1.0;
  gl_PointSize = a_size;
}
`;
// ...
const aPosition = gl.getAttributeLocation(gl.program, 'a_position');
// if xxx
gl.vertexAttrib1f(aPosition, new Float32Array([10.0]));
```

#### initShader:

```js
function initShader(gl, vertexShaderSourceCode, FragmentShaderSourceCode) {
  const program = createProgram(
    gl,
    vertexShaderSourceCode,
    FragmentShaderSourceCode
  );
  gl.useProgram(program);
  gl.program = program;
}

function createProgram(gl, vertexShaderSourceCode, FragmentShaderSourceCode) {
  const program = gl.createProgram();

  [
    { type: gl.VERTEX_SHADER, code: vertexShaderSourceCode },
    { type: gl.FRAGMENT_SHADER, code: FragmentShaderSourceCode },
  ]
    .map((item) => createShader(gl, item.type, item.code))
    .forEach((shader) => gl.attachShader(program, shader));

  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  console.log(linked);
  return program;
}

function createShader(gl, type, code) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  const compiler = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  console.log(compiler, gl, type, code);
  return shader;
}
```

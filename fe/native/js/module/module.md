# AMD、CMD、CommonJS、ES6

## 一、AMD

`AMD，Asynchronous Module Definition, 异步模块定义`。它是一个在浏览器端模块化开发的规范。
它不是`javascript`原生支持，所以使用 AMD 规范进行页面开发需要用到对应的库，也就是`RequireJS`，AMD 其实是`RequireJS`在推广的过程中对模块定义的范围化的产出。

`requireJS`主要解决两个问题：

- 多个`js`文件存在依赖关系时，被依赖的文件需要早于依赖它的文件加载到浏览器
- `js`加载的时候浏览器会阻塞渲染线程，加载文件越多，页面失去响应的时间越长

用法：
`require`需要一个`root`来作为搜索依赖的开始(类似`package.json`的`main`)，`data-main`来指定这个`root`。

```html
<script src="script/require.js" data-main="script/app.js"></script>
```

这样就指定了`root`是`app.js`，只有直接或者间接与`app.js`有依赖关系的`module`才会被插入到`html`中。

- `define()`函数：用来定义模块的函数。`args0`: 需引入模块的名字数组，`arg1`：依赖引入之后的`callback`，`callback`的参数就是引入的东西。如果有多个依赖，则参数按照引入的顺序依次传入。

```javascript
define(['dependence_name'], (args) => {
  // args就是从dependence_name引入的东西
  // ... Your fucking code ...
  return your_export
})
```

- `require()`函数： 用来引入模块的函数。

```javascript
require(['import_module_name'], (args) => {
  // args就是从import_module_name引入的东西
  // ... Your fucking code ...
})
```

- `require.config`配置：
  - `baseUrl`:加载`module`的根路径
  - `paths`：用于映射不存在根路径下面的模块路径
  - `shimes`：加载非`AMD`规范的`js`

## 二、CMD

`CMD， Common Module Definition`， 通用模块定义。
`CMD`是在`sea.js`推广的过程中产生的。在`CMD`规范中，一个模块就是一个文件。

```javascript
define(function (require, exprots, module) {
  const fs = require('fs') //接受模块标识作为唯一参数
  // exports，module则和CommonJS类似
  exports.module = {
    props: 'value',
  }
})

seajs.use(['test.js'], function (test_exports) {
  // ....
})
```

|   null                     | AMD                                                                                                                                                                                                                                   | CMD                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定义 module 时对依赖的处理 | 推崇依赖前置，在定义的时候就要声明其依赖的模块                                                                                                                                                                                        | 推崇就近依赖，只有在用到这个 module 的时候才去 require                                                                                                                  |
| 加载方式                   | async                                                                                                                                                                                                                                 | async                                                                                                                                                                   |
| 执行 module 的方式         | 加载 module 完成后就会执行该 module，所有 module 都加载执行完成后会进入 require 的回调函数，执行主逻辑。依赖的执行顺序和书写的顺序不一定一致，谁先下载完谁先执行，但是主逻辑 一定在所有的依赖加载完成后才执行(有点类似 Promise.all)。 | 加载完某个依赖后并不执行，只是下载而已。在所有的 module 加载完成后进入主逻辑，遇到 require 语句的时候才会执行对应的 module。module 的执行顺序和书写的顺序是完全一致的。 |

###

## 三、CommonJS

English time： Common -- 常识
W3C 官方定义的 API 都只能基于 Browser，而 CommonJS 则弥补了 javascript 这方面的不足。

`NodeJS`是`CommonJS`规范的主要实践者。它有四个重要的环境变量为模块化的实现提供支持：`module、exports、require、global`。
实际用时，使用`module.exports`(不推荐使用 exports)定义对外输出的 API，用`require`来引用模块。`CommonJS`用同步的方式加载模块。在`Server`上模块文件都在本地磁盘，所以读取非常快没什么不妥，但是在`Browser`由于网络的原因，更合理的方案是异步加载。
`CommonJS`对模块的定义主要分为：**模块引用、模块定义、模块标识**3 个部分。

### 1、模块引用：

```javascript
const fs = require('fs')
```

require 的执行步骤：

1.  如果是核心模块， 如 fs，则直接返回模块
2.  如果是路径，则拼接成一个绝对路径，然后先读取缓存 require.cache 再读取文件。(如果没有扩展名，则以`js => json => node`(以二进制插件模块的方式去读取)的顺序去识别)
3.  首次加载后的模块会在`require.cache`中，所以多次 require，得到的对象是同一个(引用的同一个对象)
4.  在执行模块代码的时候，会将模块包装成以下模式，以便于作用域在模块范围之内。

```javascript
;(function (exports, require, module, __filename, __dirname) {
  // module codes
})
```

5.  包装之后的代码同过 vm 原生模块的 runInThisContext()方法执行(类似 eval，不过具有明确上下文不会污染环境)，返回一个 function 对象。
    最后将当前模块对象的`exports`、`require`方法、`module`以及文件定位中得到的`完整文件路径`(包括文件名)和`文件目录`传递给这个 function 执行。

### 2、模块定义：

```javascript
function fn() {}
exports.propName = fn
module.exports = fn
```

一个`module`对象代表模块本身，`exports`是`module`的属性。一般通过在`exports`上挂载属性即可定义导出，也可以直接给`module.exports`赋值来定义导出(推荐)。

### 3、模块标识：

模块标识就是传递给`require()`方法的参数，可以是相对路径或者绝对路径，也可以是符合小驼峰命名的字符串。
`NodeJS`中`CommonJS`的实现：`Node`中模块分为 Node 提供的`核心模块`和用户编写的`文件模块`。

**核心模块**在`Node`源代码的编译过程中，编译进了二进制执行文件。在`Node`启动的时候部分核心模块就加载到了`memory`中，所以在引用核心模块的时候，文件定位和编译执行步骤可以省略，并且在路径判断中优先判断，所以它的加载速度是最快的。
**文件模块**则是在运行时动态加载，需要完整的路径分析，文件定位、编译执行等过程，速度较核心模块慢。
在`NodeJS`中引入模块需要经历如下 3 个步骤：

1. 路径分析：module.paths = [‘当前目录下的 node_modules’, ‘父目录下的 node_modules’, …， ‘跟目录下的 node_modules’]

2. 文件定位：**文件扩展名分析、目录和包的处理**。

   - 文件扩展名分析：`Node`会按`.js => .json => .node`的次序补足扩展名依次尝试。（在尝试的过程中会调用同步的 fs 模块来查看文件是否存在）
   - 目录和包的处理：可能没有对应的文件，但是存在相应的目录。这时`Node`会在此目录中查找`package.json`，并`JSON.parse`出`main`(入口文件)对应的文件。如果`main`属性错误或者没有`package.json`，则将`index`作为`main`。如果没有定位成功任何文件，则到下一个模块路径重复上述工作，如果整个`module.paths`都遍历完都没有找到目标文件，则跑出查找失败错误。

3. 编译执行：在`Node`中每个模块文件都是一个对象，编译执行是引入文件模块的最后一个阶段。定位到文件后，`Node`会新建一个模块对象，然后根据路径载入并编译。对于不同的文件扩展名，其载入的方式也有所不同：
   - `.js`: 通过`fs`模块同步读取文件后编译执行
   - `.node`：这是`C++`编写的扩展文件，通过`dlopen()`加载最后编译生成的文件。
   - `.json`：同`.js`文件，之后用`JSON.parse`解析返回结果。
     其余文件： 都按`js`的方式解析。

|  null      | CommonJS                                                                   | ES6                                     |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------- |
| keywords   | exports, require, module, **filename. **dirname                            | import, export                          |
| 导入       | const path = require('fs'); 必须将一个模块导出的所有属性都引入             | import path from 'path'; 可以只引入某个 |
| 导出       | module.exports = App;                                                      | export default App;                     |
| 导入的对象 | 随意修改 值的 copy                                                         | 不能随意修改 值的 reference             |
| 导入次数   | 可以任意次 require，除了第一次，之后的 require 都是从 require.cache 中取得 | 在头部导入，只能导入一次                |
| 加载       | 运行时加载                                                                 | 编译时输出接口                          |

## ES6 模块

ES6 的模块已经比较熟悉了，用法不多赘述，直接上码：

```javascript
import { prop } from 'app' //从app中导入prop
import { prop as newProp } from 'app' // 功能和上面一样，不过是将导入的prop重命名为newProp

import App from 'App' // 导入App的default
import * as App from 'App' // 导入App的所有属性到App对象中

export const variable = 'value' // 导出一个名为variable的常量
export { variable as newVar } // 和import 的重命名类似，将variable作为newVar导出

export default variable = 'value' // 将variable作为默认导出
export { variable as default } //  和上面的写法基本一样

export { variable } from 'module' // 导出module的variable ，该模块中无法访问
export { variable as newVar } from 'module' // 下面的自己看  不解释了
export { variable as newVar } from 'module'
export * from 'module'
```

> ps：ES6 模块导入的变量(其实应该叫常量更准确)具有以下特点：
> 变量提升、相当于被`Object.freeze()`包装过一样、import/export 只能在顶级作用域

`ES6`模块区别于`CommonJS`的运行时加载，`import` 命令会被`JavaScript`引擎静态分析，优先于模块内的其他内容执行(类似于函数声明优先于其他语句那样)， 也就是说在文件的任何位置`import`引入模块都会被提前到文件顶部。

`ES6`的模块 **自动开启严格模式**，即使没有写`'use strict';` 。
运行一个包含`import`声明的模块时，被引入的模块先导入并加载，然后根据依赖关系，每个模块的内容会使用深度优先的原则进行遍历。跳过已经执行过的模块，避免依赖循环。

okey~接下来老哥再看看(查查)`import`到底干啥了：
标准几乎没有谈到`import`该做什么，`ES6`将模块的加载细节完全交给了实现。
大致来说，`js`引擎运行一个模块的时候，其行为大致可归纳为以下四步：

1. 解析：engine 去解析模块的代码，检查语法等。
2. 加载：递归加载所有被引入的模块，**深度优先**。
3. 链接：为每个新加载的模块创建一个作用域，并将模块中的声明绑入其中（包括从其他模块中引入的）。
   当`js`引擎开始执行加载进来的模块中的代码的时候，`import`的处理过程已经完了，所以`js`引擎执行到一行`import`声明的时候什么也不会干。引入都是静态实现的，等到代码执行的时候就啥都不干了。

> 既然说到了模块(module)，那就顺便提一下它和脚本(script)的区别(注意，我这里说的区别仅限于在 Web 浏览器中)：

|   -                                                   | module                                                                                                                                                     | script                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 使用方式 (当然还有其他的执行方式，在这里不做过多讨论) | <script src="./source.js type="module" />                                                                                                                  | <script src="./source.js type="text/javascript" /> |
| 下载                                                  | ① 遇到\<script>时，会自动应用 defer。<br />② 下载 && 解析 module。<br />③ 递归下载 module 中导入的资源。下载阶段完成。                                     | 遇到\<script>时默认阻塞文档渲染，开启下载。        |
| 执行方式                                              | ① 下载完成后会递归执行 module 中导入的资源。<br />② 然后执行 module 本身。<br />ps：内联 module 少了下载 module 本身的步骤，其他步骤和引入的 module 相同。 | 默认是下载完成立即执行                             |

## 参考链接：

[前端模块化：CommonJS,AMD,CMD,ES6](https://juejin.im/post/5aaa37c8f265da23945f365c)

[ES6 的模块系统](https://juejin.im/entry/582ff966da2f600063f3f93f)

[深入浅出 NodeJS](https://baike.baidu.com/item/%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BANode.js/12639161?fr=aladdin)

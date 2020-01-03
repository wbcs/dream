# default
```js
import { a, b } from 'module'
```
在只有default导出的时候，ab均为undefined。因为解构赋值只有在 VariableDeclaration 才是解构赋值，在importDeclaration中就只是个 ImportSpecifier。

但是因为之前 babel 或者其他的一些转译工具对标准的错误解读，导致了一些不一致性。虽然有对应的插件能够解决这个问题，但是一旦引入plugin，就意味着要把代码转译成cjs，就不能对代码进行静态分析了，也就意味着对Tree-shaking说👋了.

所以：
```js
// 之前的理解, 这样是等价的
const hehe = require('-0-')
import hehe from '-0-'

// 但是正确的应该是
const hehe = require('-0-')
import * as hehe from '-0-'
```

# esModuleInterop
esModuleInterop: false
```js
// 会报错没有默认的导出
import t from '@babel/types'
// ok
import * as t from '@babel/types'
```
esModuleInterop: true 就都ok，正常使用。

所以这个flag对非esModule使用hack：
```js
const t = fn(require('@babel/types'))
function fn(mod) {
  // 如果他是es模块，则直接返回module.exports
  if (mod && mod.__esModule) return mod
  const res = {}
  if (mod != null) {
    // 否则说明不是es模块
    // 则遍历module.exports，添加属性到空对象中
    // res.default设置为原先的module.exports
    for (var k in mod) {
      if (Object.hasOwnProperty.call(mod, k)) {
        res[k] = mod[k];
      }
    }
  }
  res['default'] = mod
  return res
}
```
总结一下，就是在不是 `esModule` 的情况下, `esModuleInterop: true` ，会认为 `module.exports` 为默认导出同时也是 `ImportNameSpace` ， `false` 则会严格的认为 `module.exports.default` 为默认导出, `module.exports` 是 `ImportNameSpace` 。

> 可以看到，如果原来 `module.exports` 中存在 `default` 在 `ImportNameSpace` 的情况下会被覆盖掉，这也是为什么不推荐存成员导出和默认导出共存的原因。


# 概述
本文讲的是`Vue`中的一个指令：`v-model`

# v-model语法糖
之前或多或少都知道一些关于`v-model`的知识：`v-model`实际上只不过是`v-bind`和`v-on:input`的语法糖罢了。
```html
<input type="text" v-model="value" />
<!-- 等价于 -->
<input type="text" v-bind="value" v-on:input="value = $event.target.value" />
```
> 其中input和textarea触发的是input事件，而select触发的是change事件。

> 但是关于`v-model`所包含的其他知识点还有一些，今天就来看看

# v-model
## 可以用在什么元素上？
只能用在`<input type="text" />`、`<select></select>`、`<textarea></textarea>`等元素上。

## 它是如何解决IME（input method editor)的？
查看`Vue`源码，找到这样一段代码：
```javascript
if (/*...*/) {
  // ...
} else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
  el._vModifiers = binding.modifiers
  if (!binding.modifiers.lazy) {
    el.addEventListener('compositionstart', onCompositionStart)
    el.addEventListener('compositionend', onCompositionEnd)
    // Safari < 10.2 & UIWebView doesn't fire compositionend when
    // switching focus before confirming composition choice
    // this also fixes the issue where some browsers e.g. iOS Chrome
    // fires "change" instead of "input" on autocomplete.
    el.addEventListener('change', onCompositionEnd)
    /* istanbul ignore if */
    if (isIE9) {
      el.vmodel = true
    }
  }
}
function onCompositionStart (e) {
  e.target.composing = true
}
function onCompositionEnd (e) {
  // 防止无故触发input事件
  if (!e.target.composing) return
  e.target.composing = false
  trigger(e.target, 'input')
}
```
> 可以发现，`Vue`是通过`compositionstart`、和`compositionend`事件来解决IME的

## 如何判断是否修改
这个问题只存在于`select`的情况，因为`input、textarea`仅仅只是`string`，很好判断。但是`select`绑定的是一个数组，而每个`option`的`value`也可以是任意的`js`类型值，这就牵扯到判断的问题。

因为有时候有的人会直接将一个对象表达式写在`html`模板中，虽然值相同，但是索引不同，如果仅仅采用`==`或者`===`进行判断势必会造成重复渲染，降低效率。

在`Vue`中，它实现了一套自己的判断规则：
```javascript
export function looseEqual (a: any, b: any): boolean {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

```
> 可以看到，如果两个值是对象，又会分别判断是否为数组、`Date`对象等。数组会遍历递归地进行判断，确保值是相等的。如果是`Date`对象则会判断时间戳，如果均不是数组，则遍历`key`进行属性的递归判断。反之，如果两个值均不是对象，则会将其转为`string`进行判断。其余情况均为`false`。

## change事件的触发
上一步我们讲到，`Vue`在判断是否应该更新时，是判断对象的值，而非单纯的判断索引。那么如果我这样写，在选择不同的`option`时，具体会发生什么呢？
```html
<select v-model="arr" @change="console.log('change~')">
  <option :value="{}">option0</option>
  <option :value="{}">option1</option>
</select>
```
请问，现在选择这两个`option`的时候，会发生什么呢？

如果没有深入了解，肯定会说正常来回切换。但是经过之前的讲解，我们知道`Vue`在内部判断的时候会判断出这两个`option`的`value`相等，所以不会修改`arr`。于是不管你怎么选择，（除了第一次无初始值）`select`选中的永远都是第一个`option`，因为在遍历到当前`value`和原来的`value`相等时就会直接将`options`数组的确切下标`i`赋值给`select.selectedIndex`：
```javascript
if (looseEqual(getValue(option), value)) {
  if (el.selectedIndex !== i) {
    el.selectedIndex = i
  }
  return
}
```
> 不过当`select`的`multiple`为`true`时，影响不大，和`value`不同的行为基本一致，不同的是在选中一个`option`时，和它`value`相同的`option`在视图上也会被选中，但实际的`arr`中依然只有一个被选中的`value`。

但是既然`value`根本没有改变，那`change`会触发吗？答案是会触发。
```javascript
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      const prevOptions = el._vOptions
      const curOptions = el._vOptions = [].map.call(el.options, getValue)
      // 只要选中的options发生变化或者value发生变化就会触发change事件
      if (curOptions.some((o, i) => !looseEqual(o, prevOptions[i]))) {
        // trigger change event if
        // no matching option found for at least one value
        const needReset = el.multiple
          ? binding.value.some(v => hasNoMatchingOption(v, curOptions))
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions)
        if (needReset) {
          trigger(el, 'change')
        }
      }
    }
```
> 可以看到，触发`change`事件并不仅仅判断`value`是否改变，还会判断`options`。虽然`value`经过判断和之前一样，但是`option`和原来有不匹配的情况，这个时候就会触发`change`事件。

## 还有点我之前不知道的事
之前不知道Vue底层是如何触发各种事件的，自从今天到了它：
```javascript
function trigger (el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}
```

# 总结
ok，关于v-model的东西目前大概就只知道这些了，回头如果有新发现会及时补充。

```javascript
setTimeout(() => {
  time_interval = true;
}, 5000);
```
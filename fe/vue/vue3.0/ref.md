# ref
ref是为了解决js中基本变量值传递无法使用引用的问题，于是在基本类型上面进行装箱操作。

# 用法
```html
<template>
  <div @click="increment">
    clicked {{counter}} times
    double {{double}}
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue'

/** 
 * 显然这么写，是不行的
*/
function computed(watcher) {
  let value = watcher()
  watch(() => {
    value = watcher()
  })
  return value
}
/** 
 * 阔以
*/
function computed(watcher) {
  let ref = {
    value: watcher()
  }
  watch(() => {
    ref = {
      value: watcher()
    }
  })
  return ref
}

export default {
  setup() {
    const state = reactive({
      counter: 0,
      double: computed(() => state.counter * 2)
    })
    const increment = () => state.counter++
    return {
      state,
      increment
    }
  }
}
</script>
```
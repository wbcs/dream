# 三大原则
+ 单一数据源
+ 纯函数修改state
+ 只读state

# 概念
不能直接去修改state，需要通过dispatch来提交一个更新state的请求，action则是对要修改state的描述。

# temp
```ts
const app = (state = {}, action) => {
  return {
    key0: reducer0(state.key0, action),
    key1: reducer1(state.key1, action),
    key2: reducer2(state.key2, action),
  }
}
const app = combineReducers({
  key0: reducer0,
  key1: reducer1,
  key2: reducer2,
})
// combineReducers的作用就是告诉把state对应的属性和reduce对应起来
// 然后返回一个函数，这个函数会返回最终的state
// 自己写一个的话：
function combineReducers(reducers = {} as Record<keyof State, Reducer>) {
  return (state = {}, action: object) => {
    const store = {} as Record<keyof State, any>
    const keys = Object.keys(reducers) as Array<keyof State>
    keys.forEach(key => {
      store[key] = reducers[key]((state as State)[key], action)
    })
    return store
  }
}
```
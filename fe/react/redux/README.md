# 三大原则

- 单一数据源
- 纯函数修改 state
- 只读 state

优点：

- predictable state container
-

# 概念

不能直接去修改 state，需要通过 dispatch 来提交一个更新 state 的请求，action 则是对要修改 state 的描述。

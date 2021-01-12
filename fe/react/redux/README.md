# 三大原则
+ 单一数据源
+ 纯函数修改state
+ 只读state

优点：
- predictable state container
- 

# 概念
不能直接去修改state，需要通过dispatch来提交一个更新state的请求，action则是对要修改state的描述。


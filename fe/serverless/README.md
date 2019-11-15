# 什么是serverless
`serverless`：无服务器架构。`server`逻辑由开发者实现，运行在无状态的计算容器中，由事件触发，完全被第三方管理。业务层的`data`存储在`DB`等存储资源中。

`serverless`是由事件驱动的全托管计算服务。无需管理`server`等基础设施，只需要编写`code`和选择`trigger并`且上传。剩下的工作（实例选择、 扩缩容、部署、容灾、监控、日志、安全补丁等）全部由`serverless`系统托管。用户只需要为代码实际运行消耗的资源付费，代码没有运行不产生费用。

`serverless`相对于serverful,对于业务方强调noserver，意思只是说业务人员无须关注server。业务人员只需要聚焦于业务逻辑代码。

几个名词：
+ IaaS，Ifrastructure as a service
+ PaaS, Platform as a service
+ BaaS, Backend as a service
+ FaaS, Function as a service

# 优缺点

## 缺点
+ 状态管理方面：对于有状态的服务，需要和存储交互，不可避免的增加了延迟和复杂性、耦合性。而要自由的缩放，无状态又是必须的，所以对于stateful服务不适合serverless
+ 延迟：
+ 

https://jimmysong.io/posts/what-is-serverless/

https://jimmysong.io/serverless-handbook/
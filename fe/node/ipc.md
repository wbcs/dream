## ipc

ipc 即 Inter-Processing Call, 分为两种:

- lpc: Location-Processing Call
- rpc: Remote-Processing Call

### lpc

- 信号量: 一个 flat，只能表示一些状态信息，不能传递具体的数据
- 管道：两个进程同步地对同一文件的读写。根据文件位置的不同又分为：
  - 匿名管道：文件在内存
  - 命名管道：文件在 disk
- 消息队列：在管道的基础上引入 buffer，能够实现异步通信，依然是针对两个进程
- 共享内存：能够实现多进程通信，但是需要进程自行控制访问顺序

> 这些都是本地进程通信方式，而远程进程通信则是根据网络协议来进行通信的

### rpc

基于各种网络协议封装

> 如果把消息进一步封装成方法调用，称之为 rmi Rmote Method Invoke

## nodejs 中的进程通信

- child_process: 父子进程之间的通信
- cluster：多进程之间的通信

- spawn
- exec
- execFile
- fork

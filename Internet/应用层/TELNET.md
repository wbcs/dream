# 概述

`TELNET`远程终端协议。

也是基于`TCP`的，能够将用户的键盘输入传送到远程主机，同时将远程主机的输出通过`TCP`返回到用户屏幕。

和[FTP](./FTP.md)类似，它也是`CS`模式。`server`中的主进程等待新的请求，并创建新的从属进程来处理每一个连接。

# TELNET

`FTP`的任务是屏蔽掉不同主机、不同`OS`文件之间的差异，同样的，`TELNET`要解决的是不同`OS`的命令差异，比如：换行不同，有的是`CR`，有的是`LF`。还有的是`CR-LF`；中断不同，有的`OS`是`ctl + c`有的是`esc`，等等。

`TELNET`就是要屏蔽掉这些。它定义了数据和命令应该怎样通过互联网，这些定义就是`网络虚拟终端` ,`NVT` (`Network Virtual Terminal`)。

`TELNET` `client`会将`user`的命令都转换为`NVT`格式，然后传送到`server`，`server`将`NVT`的命令转换为自己所需的格式即可。

向`user`返回`data`时，同样将`server`的格式`NVT`格式，本地再转换为本地系统所需的格式。

> 简单的说就是引入一种与特定操作系统、主机无关的中间格式命令`NVT`，在发送命令之前将命令都转为`NVT`，接收方收到之后再讲`NVT`转换为自己需要的格式就 ok 了。

## NVT 的格式

`NVT`格式定义：所有的字符都使用`8bit`一个`byte`，在传送的时候使用`7bit` `ASCII`进行传送，当最高位置 1 的时候用作控制命令。

`NVT`可以看做是`ASCII`的自己，`NVT`所有的可见字符都存在于`ASCII`中。除此之外，`NVT`还将换行统一为`CR-LF`。

> `TELNET`还有选项协商，可以让`client`和`server`商定使用更多的终端功能。协商的双方是平等的。

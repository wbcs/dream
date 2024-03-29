# 网络层的设计思想

首先明确一点，网络层不提供可靠的数据传输服务，这是其上层协议(`TCP`)的工作。

设计思想：**网络层向上只提供简单灵活的、无连接的、尽最大努力交付的数据报服务**。

网络层在发送分组的时候，各个分组独立发送，前后分组没有关系、独立选择路由。

# 虚拟互连网络

在了解`IP`之前必须要先学习**虚拟互连网络**。

全世界范围内有非常多的网络，这些网络形态各异，如果想要让他们能够互连起来，并且使之可以通信，那么任务和需要解决的问题是非常巨大和复杂的。

而要使得不同的网络能够互连起来就需要使用一些**中间设备**，这些中间设备可以根据不同层次进行划分：

- 转发器：`物理层`使用的中间设备；
- 网桥：`数据链路层`使用的中间设备，也叫`桥接器`；
- 路由器：`网络层`使用的中间设备；
- 网关：在`网络层以上`的层次使用的中间设备。用网关连接两个不兼容的系统需要在高层中进行协议的转换。

> 在使用网桥或转发器时，仅仅是将一个网络扩大了，本质还是同一个网络(因为是同一个网络号)，而网关比较复杂，现在使用较少。因此现在在讨论网络互连时，都是指的用**路由器**进行`网络互连`和`路由选择`。
>
> > 路由器其实就是专用计算机，用来在互联网中进行路由选择。

将众多的网络通过`IP`协议进行互连，就可以将本来各种物理网络的异构性的网络在网络层上看起来好像是一个统一的网络。这种网络就是**逻辑互连网络**，就是**虚拟互连网络**。这种使用`IP`协议的虚拟互联网简称为`IP`网（所以`IP`网是虚拟的）。

最终结果就是，不同网络的主机进行通信时，好像在单个网络上通信一样。看不到具体的异构细节。比如：编址方案，路由选择协议等。

> 如果在这种覆盖全球的`IP`网的上层使用`TCP`协议，就是现在的*互联网*。

# 网络层协议

最主要也是最重要的无疑是 IP 协议，不过在使用 IP 协议的时候，IP 协议会用一些其他协议，所以把这些协议也算在了网络层中：

- 地址解析协议 ARP
- 网际控制报文协议 ICMP
- 网际组管理协议 IGMP
- 网际协议 IP
  > 以前一直误以为这些协议都是 IP 协议，误以为 IP 就是网络层。现在弄清楚了 IP 只是网络层的一个协议，它用到的协议也属于网络层协议。

# 两台主机之间的通信

比如，两台主机`H1`、`H2`现在要进行通信，其详细过程如下：

1.  `H1`检查自己的路由表，看目的主机是否就在本网络上。如果在则直接交付，否则把`IP`数据报发送给某个路由器。
2.  这个路由器在收到`IP`数据报之后，同样查看自己的路由表（书上说转发表更准确），找到自己应该将此`IP`数据报交付给对应的路由器。
3.  这个对应的路由同样也重复上述操作，，直到找到跟目的主机`H2`在同一网络的某个路由器。
4.  最后的路由器在检查路由表的时候就知道，不需要再使用别的路由器转发了。于是将`IP`数据报直接交付给目的主机`H2`即可。
    > 主机的协议栈有 5 层，路由器只有 3 层。

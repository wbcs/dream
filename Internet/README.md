# 计算机网络

本文计算机网络系列文章的先导文章。这个系列打算写 7 个子系列：

1. [概述篇](./README.md)
2. [应用层](./应用层)
   - [DNS](./应用层/DNS)
   - [HTTP](./应用层/HTTP)
3. [运输层](./运输层)
   - [TCP](./运输层/TCP.md)
   - [UDP](./运输层/UDP.md)
4. [网络层](./网络层)
   - [IP](./网络层/IP.md)
   - [ARP](./网络层/ARP.md)
5. [数据链路层](./数据链路层)
6. [物理层](./物理层)
7. [进阶篇](./进阶篇)
   - HTTPS
   - 加密算法

# 基本概念

- 计算机网络：简称网络，由若干**结点**和连接这些结点的**链路**组成。
- 互连网：网络之间通过路由器互连起来，就构成了一个覆盖范围更大的计算机网络，称为**互连网**。
- 互联网：全球最大的、开放的、由众多网络互连而成的特定互连网，采用`TCP/IP`协议族作为通信规则的特定互连网，是一个名词。前身是`ARPANET`。

![](https://raw.githubusercontent.com/CyC2018/CS-Notes/master/docs/notes/pics/network-of-networks.gif)

# 互联网的组成

从其工作方式可以将互联网分为两大块：

1.  边缘部分：由所有连接在互联网上的主机组成。用户直接使用。
2.  核心部分：由大量网络和连接这些网络的路由器组成。为边缘部分提供服务。

## 边缘部分

计算机之间通信指的就是主机之间的某个进程之间通信。网络边缘的端系统之间的通信可以分为两类：`C/S、P2P`。

1.  C/S: `Client/Server` 都是指通信中所涉及的两个应用进程，`client`的请求服务的，`server`是提供服务的。
2.  P2P: `Peer to Peer` 指两台主机在通信时并不区分服务器和客户端，他们进行平等的、对等连接通信。

## 核心部分

它要向网络边缘中的大量主机提供连通性，使得主机能够向其他主机通信。其中，起特殊作用的是**路由器**(router)，它是一种特殊的计算机。是实现**分组交换**的关键构件，任务就是转发收到的分组。在接受到分组之后存储到内存，然后查找转发表发送到下一个结点。

分组交换的主要特点：采用存储转发技术，这里的存储仅仅存储在内存中，没有存到 disk 这样就保证了传输速度。发送的整块数据成为`报文`，在发送之前先把较长的报文划分成一个个更小的等长`数据段`，加上必要的控制信息组成的首部后，就构成了一个`分组`，分组又称为`包`。分组交换在传送数据之前不必先占用一条端到端的链路通信资源，只有分组在某段链路上传送的时候才占用这段链路的通信资源。

分组交换的优点：

| 优点 | 所采用的手段                                                 |
| ---- | ------------------------------------------------------------ |
| 高效 | 分组传输过程中动态分配传输带宽，对通信链路的资源是逐段占用的 |
| 灵活 | 为每个分组独立选择最合适的转发路由                           |
| 迅速 | 分组作为传送单位，可以不限建立连接就能向其他主机发送分组     |
| 可靠 | 可靠的网络协议、分布式多路由的分组交换网                     |

> 主机是为用户进行信息处理的，并且可以和其他主机通过网络交换信息。路由器则是用来转发分组的，即进行分组交换。

# 不同类别的计算机网络

## 按照网络的作用范围进行分类

1.  广域网 WAN（Wide Area Network）:覆盖范围是几十到几千公里；
2.  城域网 MAN（Metropolitan Area Network）:覆盖范围是一个城市；
3.  局域网 LAN（Local Area Network）:1km 左右；
4.  个人区域网 PAN（Personal Area Network）:1m 或更小。

## 按照使用者分类

公用网、专用网。

## 用来把用户接入到互联网的网络————接入网

# 计算机网络的性能

1.  速率：数据的传送速率，又称数据率，单位是`bit/s`或`bps`.
2.  带宽：带宽本来指某个信号具有的频带宽度，单位是`hz`，即某信道允许通过的信号频带范围。但是在计算机网络中指的是某通道传送数据的能力，在单位时间内网络的某信道所能通过的“最高速率”，单位是`bit/s`。
3.  吞吐量：单位时间内通过某个网络的实际数据量。
4.  时延：指的是数据从网络的一段传送到另一端所用的时间。由以下几部分组成：
    1.  发送时延：发送数据帧的第一个`bit`到最后一个`bit`所需的时间。 `发送时延 = 数据帧长度(bit) / 发送速率(bit/2)`
    2.  传播时延：这个很好理解，就是单词博在信道中传播一定距离所需时间。 `传播时延 = 信道长度(m) / 电磁波在信道的传播速率(m/2)`
    3.  处理时延：主机/路由器在接受分组时需要划分时间进行处理，这就产生了处理时延。
    4.  排队时延：分组在进入路由器后要在输入队列中排队等待处理，在 router 确定了转发接口后还要排队等待转发，因此产生的时间成为排队时延。
5.  时延带宽积：`传播时延 * 带宽`，也就是以`bit`为单位的链路长度。
6.  往返时间 RTT：发送方发送出数据后, 到【发送方】接受到【接收方发来】的确认信息的时延，不包括发送时延。 `有效数据率 = 数据长度 / (发送时延 + RTT)`
7.  利用率：分为信道利用率和网络利用率。前者：百分之几的时间有数据通过；后者：全网络的信道利用率的加权平均值。
    > 信道利用率并非越高越好，因为信道利用率的增大会引起时延迅速增加，如果以 D0 表示网络空闲时的时延，D 表示网络当前的时延，U 是利用率。<br>它们之间有以下关系：`D = D0 / (1 - U)`

# 具有五层协议的体系结构

## 一、应用层 application layer（第五层）

应用层的任务是：通过应用进程间的交互来完成特定的网络应用。应用层交互的数据单元称为`报文`.

> 对于不同的网络应用需要有不同的应用层协议。如，DNS、HTTP 等。

## 二、运输层 transport layer

任务：向两台主机中进程之间的通信提供**通用数据传输服务**。通用指的是不仅仅针对某个特定的网络应用，多个应用可以使用同一个运输层的服务。

由于一台主机可以同时跑多个进程，所以运输层又有复用和分用的概念：

- 复用：多个应用层进程可以同时使用下面运输层的服务；
- 分用：运输层把收到的信息交付给对应的应用层进程。

运输层主要使用一下两种协议：

- TCP(Transmission Control Protocal): 提供面向连接的、可靠的数据传输服务，单位是报文段(segment)。
- UDP(User Data Protocal): 提供无连接的、尽最大努力的数据传输服务（不保证数据的可靠性），单位是用户数据报。

## 三、网络层 network layer

网络层负责为分组交换网上的不同主机提供**通信服务**。

网络层把运输层产生的用户数据包或报文段封装成分组（包）进行传送。在`TCP/IP`体系中，该层使用`IP协议`，因此分组也叫做`IP数据报`。

> 互联网使用的网络层协议是**无连接**的网际协议 IP 和许多路由选择协议。

## 四、数据链路层 data link layer

简称链路层，在两个相邻结点传送数据时，数据链路层将网络层交下来的`IP数据报`封装成`帧`，每一帧包括数据和必要的控制信息（如：同步信息、差错控制、地址信息等）。

## 五、物理层 physical layer

在物理层上传数据的单位是 bit。物理层规定了用多大的电压代表 1/0，以及接收方如何识别这些 bit。还要确定电缆的插头应该有多少根引脚、引脚的连接方式等等。

> 传递信息用的一些物理媒体等不在物理层内，而是在其之下。物理层没有控制信息，也就是没有包头。

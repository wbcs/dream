容器

# linux container vs VM

container 相比于 VM 更加轻量。能够在相同的硬件资源下运行更懂的组件。

<img src="./assets/C040DC36-9AD1-48A1-B647-D0EEACE96546.png" width="300" />
<img src="./assets/128F7AC1-E830-4A27-8CC8-215CE85E9047.png" width="300" />

> 因为 VM 需要额外的系统进程，这就造成了除业务组件所需资源以外的开销。而 container 本质上就是运行在同一个系统下的进程而已。

当然，VM 的优点则是为运行在其之上的业务组件和运行在其他 VM 上的业务组件提供完全隔离的环境。

# container 隔离机制

## linux namespace

linux 最初会拥有一个 namespace，所有的系统资源都属于这个 namespace, 文件系统
网络接口、用户 id 等。

对于一个进程，只能够看到同一个 namespace 下的系统资源。一个进程可以隶属多个 namespace。

存在以下类型的 namespace：

- Mount (mnt)
- Process ID (pid)
- Network (net)
- Inter-process communicaion (ipd)
- UTS
- User ID (user)
  > 让 2 个进程运行在 2 个不同 namespace 的 Network，那它们各自就只能看到它自己的那组网络接口

## linux cgroups

限制 container 能够使用的系统资源。（通过 cgroups 实现，cgroups 是 linux 的内核功能，被用来限制一个/组进程的资源使用）

一个进程的资源(CPU、内存、 网络带宽等）使用量不能超出被分配的量。 这种方式下， 进程不能过分使用为其他进程保留的资源。

# docker container vs VM

docker container 通常是 linux container。

前面提到，每个 container 是隔离的，那它们是如何共享一些相同的系统资源的呢？（VM 自不必说，因为它们直接拥有相同的 OS 也就有了相同的 FS）

不同的 docker image 可能有着相同的父镜像，不同的 image 可以使用它们相同的父镜像来作为基础镜像。两个不同的 image 可以读取相同的基础镜像的文件，这样就能够共享相同文件了（其他的资源也是类似的吧？）

当然，这仅仅针对 read 操作，如果 container 要对文件进行 write 操作呢？依然是隔离的，因为 container 镜像层是只读的，container 运行时，在镜像层之上会创建一层新的可写镜像层，当某个 container 要进行 write 操作时，实际上会在可写镜像层上创建一个 copy，container 写入的正是这个 copy。

<img src="./assets/56F755C6-D1A6-4320-99F8-4CAB8858438D.png" width="300" />
<img src="./assets/CDFCFAE9-4BFC-4365-BC58-58E061CA3683.png" width="300" />

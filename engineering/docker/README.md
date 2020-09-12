# why docker?
+ 环境的切换、配置问题：把OS的环境保存下来，以后再用的时候直接pull，这样就不会因为换了电脑重装环境的问题了。
+ 应用隔离：
  + 不同的应用依赖软件可能互不兼容
  + 一个应用不应影响到其他应用（OOM、CPU 100%）

> 相比于虚拟机，开销更小更加轻量，因为各个容器本质只是进程，能够共享镜像的资源。虚拟机则存在各种重复的浪费。

# Hello World
```sh
➜ docker pull ubuntu
➜ docker run ubuntu /bin/bash echo 'Hello World'
Hello World
# 进入image的终端进行交互
➜ docker -i -t ubuntu /bin/bash # i 是 stdin，t 是 terminal
```

# 基础概念
+ image<->container => class<->instance

## image
+ 查看：`docker images`
+ 获取：`docker pull $IMAGE`
+ 删除：`docker rmi $IMAGE`
+ 给image打tag：`docker tag $IMAGE $NEW_IMAGE:$NEW_TAG`
+ 删除tag：`docker rmi -f $IMAGE:$TAG`
+ 创建：
  1. 从以存在的image所创建的container中更新，然后提交这个container:
  ```sh
    ➜ docker run -it ubuntu:15.10 /bin/sh
    $ apt-get update
    $ exit
    ➜ docker commit -m="chore: update ubuntu 15.10" -a="wbcs" $NAME_OR_HASH wbcs/ubuntu:v0
    sha256:d787a772bce0ac61db9305ce5b067760249bf695b63cca749c5c34974e3ddba3
    ➜ docker images
    REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
    wb/ubuntu           v0                  d787a772bce0        9 seconds ago       137MB
  ```
  > -m 提交信息; -a 作者; wb/ubuntu:v0 wb/ubuntu image id，v0 image tag;
  2. 使用 [dockerfile](./#dockerfile) 创建新的 image


## container
+ 查看： `docker ps -a`
+ 启动： `docker run -it ubuntu /bin/sh`
+ 启动已停止： `docker start $NAME_OR_HASH`
+ 停止：`docker stop $NAME_OR_HASH`
+ 进入：
  + `docker attach $NAME_OR_HASH` 退出container也会停止
  + `docker exec [-options] $NAME_OR_HASH $CMD` 退出container不会停止
+ 删除：`docker rm -rf $NAME_OR_HASH`
+ clear：`docker container prune` (只会干掉处于Exited的容器)
+ 查看container日志：`docker logs -f $NAME_OR_HASH`
+ 查看container内部运行的进程：`docker top $NAME_OR_HASH`

> `-d` 后台运行；`-P` 将container运行的进程监听端口映射到本机；`docker port $NAME_OR_HASH` 查看container内端口映射情况。


## Dockerfile
+ FROM: 定制image基于的镜像
+ RUN: 进入image生成的容器后执行的shell `RUN echo 'hehe'` 等价于 `RUN ['echo', 'hehe']`
+ 为了避免每次执行一条语句就生成一层image，可以：
  ```dockerfile
  FROM $image
  RUN cmd && cmd && cmd ...
  ```
+ docker build -t imageName:tag . 会从当前目录 `.` 中的 Dockerfile 生成一个镜像，新的镜像名称就是 imageName, tag 是 tag
  > `.` docker会将这个路径下的所有文件打包，发送到docker engine，这个过程无法直接使用本机文件，所以需要打包后提供给docker engine。所以在上下文路径下不要存放无用的文件。
+ COPY: `COPY [--chown=<user>:<group>] src dist` 从上下文路径的src复制文件/目录到容器的dist
+ CMD: 和RUN类似，只是执行时机不同，RUN是在docker build的时候执行，CMD则是在container执行的时候执行。一般用作为启动的container执行默认要运行的程序，可被 `docker run` 的参数覆盖.
  > 一个Dockerfile存在多个CMD时，只有最后一条会生效
+ ENTRYPOINT: 类似CMD，但不会被 docker run 的参数覆盖
+ ENV: `ENV NODE_ENV 'development'`, 后续可以直接使用 `$NODE_ENV`


### 连接
+ 端口连接：
```sh
# 当前container端口直接映射到本机
➜ docker run -d -P ubuntu python xxx.py
# 手动指定当前container的5000(tcp)端口 对应本机的 8080 端口
➜ docker run -d -p 127.0.0.1:8080:5000[/tcp] ubuntu python xxx.py
```
> 查看某个 container 中 5000 端口对应本机的端口： `docker port $NAME_OR_HASH 5000`.

+ container 互连：
流程大概就是：先创建一个docker网络，然后将各个容器加入到这个网络当中，处于同一个docker network 的容器能够互连。
```
➜ docker network create -d bridge network-name
➜ docker run -itd --name container0 --network network-name $image /bin/sh
➜ docker run -itd --name container1 --network network-name $image /bin/sh
进入container0
# ping container1
...
```


# docker hub
```sh
docker login
docker pull namespace/repository-name:tag
docker run -it $IMAGE /bin/sh
apt-get update
exit
docker commit -m="" -a="" $container namespace/repository
docker push namespace/repository
# docker logout
```
<img width="700" src="./assets/docker.webp" />

# 问题
+ 既然已经有MySQL、node等镜像了，我能不能把它们组合一下，让我的应用可以同时使用多种服务呢？
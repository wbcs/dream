# Hello World

```sh
➜ docker run $IMAGE_NAME[:version] $CMD
➜ docker run ubuntu:15.10 echo 'Hello World'
Hello World
# 进入image的终端进行交互
➜ docker -i -t ubuntu:15.10 /bin/sh # i 是 stdin，t 是 terminal
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
    $ apt-update
    $ exit
    ➜ docker commit -m "chore: update ubuntu 15.10" -a="wb" $NAME_OR_HASH wb/ubuntu:v0
    sha256:d787a772bce0ac61db9305ce5b067760249bf695b63cca749c5c34974e3ddba3
    ➜ docker images
    REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
    wb/ubuntu           v0                  d787a772bce0        9 seconds ago       137MB
  ```
  > -m 提交信息; -a 作者; wb/ubuntu:v0 wb/ubuntu image id，v0 image tag;
  2. 使用 dockerfile 创建新的 image


## container
+ 查看： `docker ps -a`
+ 启动： `docker run -it ubuntu /bin/sh`
+ 启动已停止： `docker start $NAME_OR_HASH`
+ 停止：`docker stop $NAME_OR_HASH`
+ 进入：
  + `docker attach $NAME_OR_HASH` 退出container也会停止
  + `docker exec [-options] $NAME_OR_HASH $CMD` 退出container不会停止
+ 删除：`docker rm -rf $NAME_OR_HASH`
+ clear：`docker container prune` (只会干掉处于)
+ 查看container日志：`docker logs -f $NAME_OR_HASH`
+ 查看container内部运行的进程：`docker top $NAME_OR_HASH`

> `-d` 后台运行；`-P` 将container运行的进程监听端口映射到本机；`docker port $NAME_OR_HASH` 查看container内端口映射情况。

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




`git update-server-info` 会生成 `info/refs`、 `objects/info/packs`

# 哑协议
哑协议就是在构建基于 HTTP 协议的只读版本库时通常使用的传输协议。

`git clone xxx` 的时候，哑协议的流程：
1. 获取 `info/refs`
2. 获取 HEAD
3. 获取 HEAD 指向的分支的那个 commit
4. 然后获取这个 commit 中的其他对象： parent 和 tree
> 在获取 commit 或者 tree 时，可能会 404.这时真正的对象可能在 替代版本库 或者 包文件中。如果是前者可以再获取 `objects/info/http-alternates` 如果其内容是一个替代版本库 URL 的列表，那 Git 就会去那些地址检查松散格式对象和文件。否则，需要获取 `objects/info/packs`，它会记录服务端的 pack 文件，然后获取对应 pack 文件的 idx 文件，最后就能找到你想要的对象了。

# 智能协议
智能协议和哑协议不同，不是只读的，而是能够由 client 向 server 发送一些信息。这也意味着，智能协议还需要在服务端开启一个进程，除了能够处理客户端发送来的信息之外，还能够根据这些信息为它生成合适的包文件。总共分为两组进程，分别处理数据上传、数据下载。

## 数据上传
数据上传涉及到两个进程：`git send-pack` & `git receive-pack`。

客户端在 `send-pack` 的时候，通过 SSH 连接服务器，然后在服务器尝试执行命令 

`git` 是一个内容寻址文件系统，也就是说 `git` 的核心是一个 key-value data store.

# .git
`git init` 后：

<img src="../assets/tree.png" width="300" />

+ config 文件包含项目特有的配置选项
+ description 供 GitWeb 使用，无需关心
+ hooks 目录包含客户端或服务端的 `hook scripts`
+ info 目录包含一个全局性排除（global exclude）文件， 用以放置那些不希望被记录在 `.gitignore` 文件中的 ignored patterns

其他的都是 git 核心组成部分：
+ HEAD 指向目前被检出的分支
+ objects 存储所有的数据内容
+ refs 存储指向数据（分支、远程仓库和标签等）的提交对象的指针
+ index 保存暂存区信息(git add)

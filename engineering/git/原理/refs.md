# refs
`Git` 引用。
```sh
.git/refs
├── heads
│   └── master
├── remotes
│   └── origin
│       ├── HEAD
│       └── master
└── tags
```

# 分支
`Git` 分支的本质：一个指向某一系列提交之首的指针或引用。

每一个分支对应于 `refs/heads` 下的一个同名文件，其中存储了最新一次的 commit。如果想要修改：

```sh
# 我们熟悉的做法
➜ git reset --hard $COMMIT
# 更底层的命令
➜ git update-refs refs/heads/master $COMMIT

# 创建分支也是一样的
➜ git checout -b dev
➜ git update-ref refs/heads/dev $COMMIT
```
> 除了使用 `git update-refs` 之外，还可以直接修改 `.git/refs/heads/master` 中的内容，不过为了安全起见还是推荐使用前者。

当运行类似于 `git branch <branch>` 这样的命令时，`Git` 实际上会运行 `update-ref` 命令， 取得当前所在分支最新提交对应的 `SHA-1` 值，并将其加入你想要创建的任何新引用中。

其实到这里，我们就能够只使用底层命令来完成日常的 Git 操作了：
```sh
➜ git update-index --add $FILE_PATH
➜ git write-tree
➜ echo 'first commit' | git commit-tree $HASH_OF_WRITE_TREE
➜ git update-ref refs/heads/master $HASH_OF_COMMIT_TREE
```


# HEAD
HEAD (`.git/HEAD`)文件通常是一个符号引用（symbolic reference），指向目前所在的分支。

当我们切换分支的时候， `Git` 总是将当前的分支引用写入HEAD。
```sh
➜ cat .git/HEAD
refs: refs/heads/master
➜ git checkout dev
refs: refs/heads/dev
```
> 当执行 `git commit` 的时候，除了创建一个 commit-object 外，还会用 `.git/HEAD` 中那个分支指向的 hash 作为其父 commit。

同样的，除了直接修改其内容外，还有更为安全的底层命令：
```sh
➜ git symbolic-ref HEAD refs/heads/xxx
```
> 不能把符号引用设置为一个不符合引用规范的值


# 标签引用
@TODO


# remote
在添加远程仓库并向其推送后， `Git` 会记录下每一个分支对应的 commit ，并保存在 `refs/remote/` 下。

比如我们通常以 origin 作为远程仓库名，在执行 `git push origin master` 后，可以发现 `refs/remotes/origin/master` 中的内容便是我们最新一次的 commit，也就是和 `refs/heads/master` 一样。

本地和远程引用/分支的区别在于，remote 是**只读的**。可以 checkout 到远程引用，但是 HEAD 不会更改，所以不能直接通过修改后commit来更新远程分支。

`Git` 将这些远程引用作为记录远程服务器上各分支最后已知位置状态的书签来管理。

# 总结

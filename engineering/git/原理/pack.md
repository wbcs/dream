# pack
之前说过 `.git/objects/pack` 这个在之前一直是空，那么它到底是干嘛用的呢？

因为每次 `git add` Git 都会当做是全新的数据进行压缩存储的，所以会比较耗费空间。那为什么我们不把公共部分记录下来，然后只记录差异不就可以了吗？ok，pack就是干这个的。

# git gc
执行完 `git gc` 后，我们发现 在 `objects/pack/` 下多了 `pack-$HASH.idx` 和 `pack-$HASH.pack` 两种类型的文件。而且objects 下的文件变少了，消失的都是被 commit 直接或间接引用了的文件，剩余的则是没有被任何的 commit 所引用的，这种文件被称为**悬空的**。

这个命令把 `Git objects` 进行了打包，`.pack` 存储着打包后的内容， `.idx` 记录着原来文件在 `.pack` 中的偏移位置。

而且我们可以发现，打包之后，`.git` 总体大小变小了。这是因为 `Git` 打包对象时，会查找命名及大小相近的文件，并只保存文件不同版本之间的差异内容。

# git verify-pack
通过 `git verify-pack` 这个底层命令可以让你查看已打包的内容：
```sh
# hash                                   类型   在包文件中占的大小
➜ git verify-pack -v .git/objects/pack/pack-ee37aa481b846ae691e8d7d6fcef2097774982a2.idx
1867ebb2af5c91844aa152d505b3c72d09f76998 commit 184 119 12
2b6da1524cfe5266e6f67789683c012515c95437 blob   4 13 131
762267877ae6d9846af607b752fc2a7e62aa4cee tree   36 46 144
non delta: 3 objects
.git/objects/pack/pack-ee37aa481b846ae691e8d7d6fcef2097774982a2.pack: ok
➜ git cat-file -p 2b6da1524cfe5266e6f67789683c012515c95437
abc;%
```
可以看到，此时文件的内容只有 `abc;` 大小是 4B

我们像文件append `123;`:
```sh
➜ git verify-pack -v .git/objects/pack/pack-f9580f73fb564247fe0cea8ec5fb328331adbe45.idx
4091484022342d65699bcb6d5f7ce64718676706 commit 233 150 12
1867ebb2af5c91844aa152d505b3c72d09f76998 commit 184 119 162
db63e600d336fd9484fcd375e196c9a481ba9b83 blob   9 18 281
a127b67d228f3728967176b0e4811d3a94168786 tree   36 47 299
762267877ae6d9846af607b752fc2a7e62aa4cee tree   36 46 346
2b6da1524cfe5266e6f67789683c012515c95437 blob   4 13 392
non delta: 6 objects
.git/objects/pack/pack-f9580f73fb564247fe0cea8ec5fb328331adbe45.pack: ok
➜ git cat-file -p db63e600d336fd9484fcd375e196c9a481ba9b83
abc;
123;%
```
此时文件的大小是 9B

继续写入：
```sh
➜ git verify-pack -v .git/objects/pack/pack-08900c9ff2679c8f7603ed17a0aabbf49420f670.idx
d644f80600d1eb8ca12f3b4dfd6301b64f6f2025 commit 232 148 12
4091484022342d65699bcb6d5f7ce64718676706 commit 233 150 160
1867ebb2af5c91844aa152d505b3c72d09f76998 commit 184 119 310
0ffc78df78391d794f51d5a75bb9c928e22c272a blob   26 31 429
6b39bdcb902d35251303a471fd9121dd8e17dfcb tree   36 47 460
a127b67d228f3728967176b0e4811d3a94168786 tree   36 47 507
db63e600d336fd9484fcd375e196c9a481ba9b83 blob   9 18 554
762267877ae6d9846af607b752fc2a7e62aa4cee tree   36 46 572
2b6da1524cfe5266e6f67789683c012515c95437 blob   4 13 618
non delta: 9 objects
.git/objects/pack/pack-08900c9ff2679c8f7603ed17a0aabbf49420f670.pack: ok
```
可以发现，最新一次的 commit 都是完整存储的，这是因为通常情况下需要快速访问文件的最新版本。
> 按道理来说，会保存相同部分，然后再保存diff的地方。可能是因为我们这里的文件体积都比较小，所以 `Git` 都按照完整的内容进行存储了吧。我们只需要知道 `Git` 会通过这种方式来对空间进行优化就可以啦。

# 总结
`Git` 在 push 的时候会自动对文件进行打包，不过我们也可以 `git gc` 随时对文件进行打包来节省空间。

学到的底层命令：
+ `git gc` 手动将 `objects/` 下的文件进行打包到 `objects/pack/` 下
+ `git verify-pack [-v] .git/objects/pack/$HASH.idx` 验证打包的 `Git` 存档文件
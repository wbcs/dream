# objects
git 在存储我们项目的各个版本时，在内部是根据不同的对象进行存储的：
+ blob object 保存数据内容
+ tree object 保存目录结构信息
+ commit object 保存作者/提交者、提交时间、提交注释等信息
+ tag object 保存附注标签时会创建 tag object，它的内容和 commit object 很类似

> 这些对象都是存储于 `.git/objects` 下。

# blob object
数据对象，它保存了文件的数据内容。

可以通过底层命令 `git hash-object` 对文件内容进行存储：
```sh
➜ git hash-object -w $FILE_PATH
1269488f7fb1f4b56a8c0e5eb48cecbfadfa9219
# 从标准输入读取并存储数据
➜ echo 'data' | git hash-object -w --stdin
1269488f7fb1f4b56a8c0e5eb48cecbfadfa9219
```
此命令输出一个长度为 40 个字符的校验和。 这是一个 `SHA-1` 哈希值——一个将待存储的数据外加一个头部信息（header）一起做 `SHA-1` 校验运算而得的校验和。

可以通过底层命令 `git cat-file` 来根据 `git hash-object` 返回的 hash 获取被存储数据的内容/类型：
```sh
# 内容
➜ git cat-file -p 1269488f7fb1f4b56a8c0e5eb48cecbfadfa9219
data
# 类型
➜ git cat-file -t 1269488f7fb1f4b56a8c0e5eb48cecbfadfa9219
blob
```

这样我们就能把数据的每个版本的信息都存储起来，但是要记录每个数据在每个版本下对应的每个 hash 并不现实。而且还有一个问题，*文件名、文件类型以及各个文件之间的结构*并没有被保存。仅保存了文件的内容

# tree object
一个树对象（和unix中的inodes类似）包含了一条或多条树对象记录（tree entry），每条记录含有一个指向数据对象或者子树对象的 `SHA-1` 指针，以及相应的模式、类型、文件名信息.

<img src="../assets/tree-object.png" width="500" />

树对象能解决文件名保存的问题，也允许我们将多个文件组织到一起:
```sh
➜  git cat-file -p master^{tree}
# 模式  类型          hash                                 文件名    
100644 blob b512c09d476623ff4bf8d0d63c29b784925dbdf8    .gitignore
100644 blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391    123.js
100644 blob 8e3b44475aea7909faffaff218488b048f71b776    README.md
040000 tree b4ca1f07123a4b59e72a40ef9487343a4520f3e0    assets
```

其中 assets 是个文件夹，所以类型就是 tree 了，也就是说它不是一个数据对象，而是一个指针，指向另一个树对象。

前面的数字表示git文件模式：
+ 100644 普通文件
+ 100755 可执行文件
+ 120000 符号链接文件
> 以上三种是所有的 git **数据对象**的文件模式


```sh
➜  git cat-file -p b4ca1f07123a4b59e72a40ef9487343a4520f3e0
100644 blob c2ab50ce068811a0dfa0c2db1e3ea8a6c68951eb    cat-file.png
100644 blob 040127493f73de7afe19079793d148730f7bc08d    tree.png
```

所以，通过 tree-object 就能够保存目录和文件的结构啦。

## 创建 tree object
创建一个 tree object 之前，必须将文件保存到暂存区(index)
```sh
# git-update-index  - 将工作树中的文件内容注册到索引
➜ git update-index --add --cacheinfo $FILE_PATH
```
假设我们的目录只有一个 `a.js` , 被 commit 过了。执行 `git cat-file -p master^{tree}` 能够得到一个 hash，这是一个 tree object ，表示的是 master 的最后一次 commit 的工作目录。

假设我们对 a.js 文件进行修改， 并且新添一个 b.js:
```sh
# 这里要--cacheinfo
# 因为我们add的文件是处于 .git/objects 下
# 并不位于当前的 git repository 中
➜ git hash-object -w a.js | git update-index --add --cacheinfo
➜ git hash-object -w b.js | git update-index --add --cacheinfo
➜ git write-tree | git cat-file -p
# 此时我们会得到一个暂存区的tree object
100644 blob xxx  a.js
100644 blob xxx  b.js

# 我们还可以把最后一次 commit 的 tree object 也合并到我们当前的 tree object 中
➜ git read-tree --prefix=first_commit $HASH_OF_FIRST_COMMIT
➜ git write-tree | git cat-file -p
100644 blob xxx  a.js
100644 blob xxx  b.js
040000 tree xxx first_commit
```
如果以当前的 tree object 还原一个工作目录的话，我们的目录会是：
```sh
├── a.js # 修改后的内容
├── b.js # 新创建的文件
└── first_commit
    └── a.js # 修改前的内容
```

# commit object
我们现在已经有个 tree object 在暂存区，现在试着将其提交(commit)。

经过上面的步骤，我们已经有了多个处于不同状态的 tree object ,如果我们想要跟踪这些状态并且想随时切换的话，那就必须对这些 tree object 的 hash 进行保存，并且要知道这些 hash 对应于哪个状态。

并且，我们也完全不知道是谁保存了这些快照，在什么时刻保存的，以及为什么保存这些快照。 而以上这些，正是提交对象（commit object）能为我们保存的基本信息。

## 创建 commit object
我们已经有了 `$HASH_OF_FIRST_COMMIT`, 其实可以对这个 tree object 再次提交，这会创建一个新的 commit object:
```sh
➜ echo 'first' | git commit-tree $HASH_OF_FIRST_COMMIT | git cat-file -p
tree $HASH
parent $HASH
author wangbing.cs <wangbing.cs@bytedance.com> 1594050079 +0800
committer wangbing.cs <wangbing.cs@bytedance.com> 1594050079 +0800

first
```
可以看到，commit object中保存了:
+ 被 commit 的 tree object(一般是项目顶层的 tree object)
+ 父 commit object (也就是之前一次的 commit object, 可能不存在)
+ 作者/提交者的信息：
  + user.name
  + user.email
  + unix 时间戳
+ commit 说明信息

查看当前的log：
```sh
➜ git log $LAST_TREE_OBJECT
commit c7a4bbea50ac295c83ffeefcefc494668989c55a
Author: wangbing.cs <wangbing.cs@bytedance.com>
Date:   Mon Jul 6 23:41:19 2020 +0800

    first
```

好了，现在把我们最新的 tree object 提交吧：
```sh
# 以$FIRST_COMMIT_OBJECT作为当前commit object的父commit object
➜ echo 'second commit test' | git commit-tree $LAST_TREE_OBJECT -p $FIRST_COMMIT_OBJECT | git cat-file -p
tree fd2d108ec8acbce070c7ba491c6208e6c7893120
parent c7a4bbea50ac295c83ffeefcefc494668989c55a
author wangbing.cs <wangbing.cs@bytedance.com> 1594050989 +0800
committer wangbing.cs <wangbing.cs@bytedance.com> 1594050989 +0800

second commit test

# 查看最新的log
➜ git log $SECOND_COMMIT_OBJECT
commit 9a3a7949c03191625fec0c987b51d3342a60ea2b
Author: wangbing.cs <wangbing.cs@bytedance.com>
Date:   Mon Jul 6 23:56:29 2020 +0800

    second commit test

commit c7a4bbea50ac295c83ffeefcefc494668989c55a
Author: wangbing.cs <wangbing.cs@bytedance.com>
Date:   Mon Jul 6 23:41:19 2020 +0800

    first
```

# tag object
tag 是一种和 commit 十分类似的对象。
object|存储信息|区别
-|-|-
commit|父commit,tree,提交时间,注释,提交者|指针指向tree
tag|commit,时间,注释,创建者|指针指向commit

它像是一个永不移动的分支引用(都位于refs下)——永远指向同一个提交对象，只不过给这个提交对象加上一个更友好的名字罢了。

# 对象存储
接下来看看一个对象是如何被存储的，上面提到 hash 是根据一个 header 和内容一起做 `SHA-1` 检验和得到的，先来看看这个 header 是什么吧：
```ruby
# 以 "fuck you." 为例
content = "fuck you."
header = "blob #{content.length}\0"
```
header 的格式为: `类型 + 空格 + 数据长度 + 空字节`.

可以发现，git 会根据数据的内容判断出要存储的是数据对象（因为 tree、commit 的内容都是有固定格式的）,所以对于数据 `"fuck you"` type 是 blob。

然后 git 会将 header 和 content 拼接起来，计算 SHA-1 检验和，用伪代码就是：`hash = SHA1(header + content)`

以上流程用 Ruby 表示就是：
```ruby
require 'digest/sha1'
content = "fuck you."
header = "blob #{content.length}\0"
store = header + content
hash = Digest::SHA1.hexdigest(store)
# 89a88df2029899de144e6208b6504199163ed794
```
git：
```sh
# -n 避免在输入时添加换行
➜ echo -n "fuck you." | git hash-object --stdin
89a88df2029899de144e6208b6504199163ed794
```
欧耶，一毛一样！

当然，为了节省磁盘空间，git 还将最终要保存的内容做了 zlib 压缩，然后取得 hash 的前2个字母作为目录名称，其余作为文件名称，最后存储至 `.git/objects` 下。

完整的code：
```ruby
require 'digest/sha1'
require 'zlib'
require 'fileutils'

content = "fuck you."
header = "blob #{content.length}\0"
store = header + content
hash = Digest::SHA1.hexdigest(store)
path = '.git/objects/' + hash[0,2] + '/' + hash[2,38]
zlib_content = Zlib::Deflate.deflate(store)
FileUtils.mkdir_p(File.dirname(path))
File.open(path, 'w') { |f| f.write zlib_content }
```
> 不仅仅是 ruby，其他语言也是一样的，我们只需要知道原理即可。

验证一下：
```sh
➜ git cat-file -p 89a88df2029899de144e6208b6504199163ed794
fuck you.%
```
所有的 git objects 都是这样存储的，只不过 blob 的内容可以是任意的，而 tree 和 commit 的内容是有固定格式的。

# 总结
通过对 Git 中的各种 objects 的学习，我学会了 Git 是如何实现对整个 git repository 进行版本存储的：
+ `git add` 的时候，将文件的内容存储为 blob，并更新 index
+ `git commit` 的时候，`Git` 把文件之间的结构存储为 tree， 然后将我们 index 内的 tree 进行提交，将当前的 **tree、提交时间、提交人以及提交注释** 都存储在 commit object 中，最后更新 HEAD 指向 ref 文件的内容为此次 commit 的 hash。

当我们想要回滚的时候，只需要查看 log ，根据我们当初的提交注释找到对应的 commit object。<br />
然后将这个 commit object 的 hash 交给 git（比如 git reset --hard $HASH）。<br />
git 会根据 commit object 中的信息，将工作目录还原成对应的版本。

学习到的底层命令：
+ `git hash-object [-w] $FILE_PATH`: 将任意数据存储到 `.git/objects/` (前提是有 -w)并返回一个 hash
+ `git cat-file [-p] [-t] $HASH_OF_SHA_1`: 根据 `git hash-object` 返回的 hash 获取被存储数据的 类型(-t)/内容(-p)
+ `git update-index [--add] [--cacheinfo] $FILE_PATH`: 将指定的文件加入暂存区，`--cacheinfo` 作用是添加不存于当前 git repository 的文件。
+ `git write-tree`: 根据当前的 index 中的文件，生成一个 tree-object
+ `git read-tree [--prefix=xxx] $HASH_OF_TREE`: 将 `$HASH_OF_TREE` 指向的 tree 合并到我们当前的 tree-object 中
+ `git commit-tree $HASH_OF_TREE [-p]`: 提交当前的 tree-object ，-p是指定其父 commit-object 的 hash

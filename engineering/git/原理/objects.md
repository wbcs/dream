# objects
git 在存储我们项目的各个版本时，在内部是根据不同的对象进行存储的：
+ blob object 保存数据内容
+ tree object 保存目录结果信息
+ commit object 保存作者/提交者、提交时间、提交注释等信心

> 这些对象都是存储于 `.git/objects` 下。

# blob object
数据对象，它保存了文件的数据内容。

# tree object
一个树对象（和unix中的inodes类似）包含了一条或多条树对象记录（tree entry），每条记录含有一个指向数据对象或者子树对象的 SHA-1 指针，以及相应的模式、类型、文件名信息.

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

# 对象存储

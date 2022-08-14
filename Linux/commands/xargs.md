# xargs

用法：

```sh
# -t 在执行命令之前先将命令打印出来
ls *.js | xargs -t ls -al
# 实际执行的命令
ls -al a.js b.js c.js
```

`xargs` 可以将输入内容（通常通过命令行管道传递），转成后续命令的参数，通常用途有：

- 命令组合：尤其是一些命令不支持管道输入，比如 `ls` 。
- 避免参数过长： `xargs` 可以通过 `-nx` 来将参数分组，避免参数过长。

# 参数

- `-t` 执行最终的指令之前先将其打印出来
- `-I R` 意为 `--replace=R` ，也就是说 -I 后面的表达式会被参数替换掉：

```sh
ls *.js | xargs -t -I '{}' cp {} {}.hehe
# 假设有a.js b.js
cp a.js a.js.hehe
cp b.js b.js.hehe
```

> R 是必填的

- `-nx` 参数分组，因为命令行对命令的长度是有限制的，所以可以使用这个参数来避免参数过长:

```sh
# nx 的 x 指的是每x个参数为一组
ls *.js | xargs -t -n2 ls -al
# 最终的指令其实是
ls -al a.js b.js
ls -al c.js
```

> xargs 将输入的内容转为后续指令的参数时，是根据 空格 或 `\n` 来分割的，所以如果文件名中存在空格时，可以这样： `find . -name '*.css' -print0 | xargs -t -0 ls -al`。 `-print0` 告诉 `find` 输出文件名时在末尾加上 `NULL` ，`-0` 是告诉 `xargs` 根据 `NULL` 来分割输入。

# 参考

[程序员小卡](https://www.cnblogs.com/chyingp/p/linux-command-xargs.html)

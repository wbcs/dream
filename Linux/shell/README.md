# 什么是 shell

狭义的`shell`是`command line`方面的软件。广义的`shell`指所有能够操作应用程序的接口。

# bash

`shell`有很多种，`linux`使用的是 `bunrne again shell` 简称 bash。

> Mac 默认使用的是 zsh

要想知道系统支持哪些`shell`，可以查看`/ect/shells`这个文件：

```
# List of acceptable shells for chpass(1).
# Ftpd will not allow users to connect who are not using
# one of these shells.

/bin/bash
/bin/csh
/bin/ksh
/bin/sh
/bin/tcsh
/bin/zsh
```

> 合法的`shell`都会写入这个`shells`文件中。有些应用程序会在运行过程中去检查用户能够使用的`shells`，查询的途径就是这个`/ect/shells`文件。

# 检测 cmd 是否为 shell 内置命令

```sh
# 检测cmd是否为bash的内置命令
type cmd
```

# 变量

- 查看环境变量：`env`
- 查看所有变量（包括自定义）：`set`

一些重要的环境变量：

- ?:上一条命令回传码（成功执行 0，否则非 0）
- $:当前 shell 的 pid

## 环境变量和自定义变量的区别

子进程会继承父进程的环境变量，但不继承自定义变量。

这里所谓的子进程就是`bash`执行某条命令时会创建子进程，在执行命令这段时间父进程`sleep`，子进程工作，等到子进程被关闭才回到父进程。

子进程在工作的时候能访问父进程的环境变量，但不能方位自定义变量。

> 要想自定义子进程能够访问的变量，需要`export`一下：`export variable_name`

## $PATH

我们在执行一个命令的时候，OS 会从$PATH 指定的目录挨个查找同名文件。如果我们在某个 dir/bin 下有新命令，需要在全局任何地方都能执行，只需要：

```sh
# 不同的path通过:分隔
$ PATH="$PATH":dir/bin
```

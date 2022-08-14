# ps

ps: process status

```sh
  PID TTY          TIME CMD
   14 pts/0    00:00:00 bash
   29 pts/0    00:00:00 ps
```

> TTY 伪终端

- -aux 显示所有包含其他使用者的行程

```sh
root@70efbc7b2438:/# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  1.5 391868 31872 ?        Ssl  11:47   0:00 node app.js
root        14  0.0  0.1  18188  3284 pts/0    Ss   11:58   0:00 bash
root        27  0.0  0.1  36636  2900 pts/0    R+   12:05   0:00 ps aux
```

> UNIX 有两个变体，贝尔实验室的` AT＆T版本` 和 加州大学伯克利分校的`BSD版本`。ps 的选项在两个版本中有所不同。现在，OS X 主要符合现代 UNIX 标准，该标准遵循 ps 的 AT＆T 选项。但是由于 BSD ps 不需要前导“-”选项，并且习惯于键入“ ps aux”，因此 Apple 决定保留其原始 BSD 解释的顺序。也就是说，在 Mac OS 中，`ps -aux 是 ps aux`, `ps -aux` 表示查看用户是 `x` 的进程状态

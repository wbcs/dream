# 一般模式

一般模式就是刚刚打开不键入 i 等无法编辑状态的那个模式。

按键说明：

| null            | null                         |
| --------------- | ---------------------------- |
| `ctrl + f`      | 下一页                       |
| `ctrl + b`      | 上一页                       |
| `0`             | 移动到当前行最前端           |
| `$`             | 移动到当前行的最后端         |
| `gg`            | 移动到当前文件的最前端       |
| `G(区分大小写)` | 移动到本文件的最后端         |
| `nG(n: number)` | 移动到第 n 行的最后端        |
| `/some_letters` | 查找`some_letters`(向下查找) |
| `?some_letters` | 同上，只不过是向上查找       |
| `n/N`           | 分别是查询下一个、上一个     |

# 编辑模式

按键说明：

| null   | null                                                       |
| ------ | ---------------------------------------------------------- |
| `i(a)` | 当前光标字符之前(后)插入                                   |
| `I`    | 当前行第一个不为空格字符之前                               |
| `A`    | 当前光标所在行的最后进行插入                               |
| `o(O)` | 当前行之后(前)插入一个新行                                 |
| `r(R)` | 替换光标处的那个 letter**1**次，R 则会**一直**替换直到 ESC |
| `ESC`  | 不解释了                                                   |

# 一般模式切换至命令行模式

| null       | null                         |
| ---------- | ---------------------------- |
| `w`        | 保存不离开                   |
| `q`        | 离开                         |
| `q!`       | 离开不保存                   |
| `wq`       | 保存&离开                    |
| `!cmd`     | 在`vim`中查看`cmd`的输出结果 |
| `set nu`   | 显示行号                     |
| `set nonu` | 取消显示行号                 |

> 在其他命令中，强制完成某个`cli`，在对应的`cmd`后添加`!`即可。不过这个是在你有相应的权限的前提下才可以的。

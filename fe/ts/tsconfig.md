# tsconfig.json
如果一个目录下有tsconfig.json 说明当前目录是整个ts project的root。

tsconfig.json中指定了一些编译options。

# tsc
不指定任何参数的情况下，会从按照以下顺序去寻找tsconfig.json文件：
+ 当前目录下
+ 父目录
+ 依次类推

```sh
# -p 或 -project 指明一个目录
tsc -p dir
```
这个时候会去dir目录下寻找tsconfig.json,当前目录下会被忽略。

# 具体options
## files
```json
{
  "files": [
    "A.ts",
    "B.ts"
  ]
}
```
files指明包含的ts文件

## include
也可以使用include来指明某个dir下
```json
{
  "include": [
    "src/**/*"
  ]
}
```
> **递归包括子目录

## exclude
排除的目录
```json
{
  "exclude": [
    "node_modules"
  ]
}
```
注意：exclude不能排除files中的文件，只能过滤include。

没有files、include的时候会包含当前目录以及子目录下的所有ts文件，exclude会被排除。

> outdir中的文件不会被包含，除非使用files手动添加。
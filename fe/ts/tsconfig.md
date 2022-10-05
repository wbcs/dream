# tsconfig.json

如果一个目录下有 tsconfig.json 说明当前目录是整个 ts project 的 root。

tsconfig.json 中指定了一些编译 options。

# tsc

不指定任何参数的情况下，会从按照以下顺序去寻找 tsconfig.json 文件：

- 当前目录下
- 父目录
- 依次类推

```sh
# -p 或 -project 指明一个目录
tsc -p dir
```

这个时候会去 dir 目录下寻找 tsconfig.json,当前目录下会被忽略。

# 具体 options

## files

```json
{
  "files": ["A.ts", "B.ts"]
}
```

files 指明包含的 ts 文件

## include

也可以使用 include 来指明某个 dir 下

```json
{
  "include": ["src/**/*"]
}
```

> \*\*递归包括子目录

## exclude

排除的目录

```json
{
  "exclude": ["node_modules"]
}
```

注意：exclude 不能排除 files 中的文件，只能过滤 include。

没有 files、include 的时候会包含当前目录以及子目录下的所有 ts 文件，exclude 会被排除。

> outdir 中的文件不会被包含，除非使用 files 手动添加。

## reference

tsconfig.json

```json
{
  "reference": [{ "path": "../some-path" }]
}
```

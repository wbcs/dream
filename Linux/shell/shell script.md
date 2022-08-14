# 人生中第一个 shell

把文件夹内部的文件名重命名的一个脚本

```sh
new_name=(
  #
)
old_name=(
  #
)
counter=0
for file in `ls`; do
  echo `mv ${old_name[$counter]}.jpg ${new_name[$counter]}.jpg`
  counter=`expr $counter + 1`
done
```

# 变量

直接写就定义了：`a=1`
变量自增：`let "a++"`

# 数组

- 定义：arr=('1' '2' '3')
- 访问：${arr[0]}
- 变量访问：${arr[$variable]}
- 得到数组长度：length=${#arr[*]}

于 js 映射关系如下：

```js
const arr = ['1', '2', '3'];
// ------------------------
arr=('1' '2' '3')

arr[1]
// ------------------------
${arr[1]}

let n = 2;
arr[n]
// ------------------------
n=2
${arr[$n]}

arr.length
// ------------------------
${#arr[*]}
```

# 流程控制

`if-else、if-else if-else`

```sh
if condition
then
  command
else
fi

if condition0
then
  command0
elif condition1
then
  command1
else
  command2
```

- 大于：`-gt`
- 小于：`-lt`
- 等于：`-eq`
  > 太反人类了，所以

```sh
a=0
if (( $a > 1 )) # < != ==  >= <=
then
  command
fi
```

# 循环

for：

```sh
for var in item0 item1 item2
do
  command
done

for (( ))
```

while:

```sh
counter=0
while (( $counter < 10 ))
do
  echo $counter
  let "counter++"
done
```

# 读取键盘

```sh
while read FILM
do
  echo $FILM
done
```

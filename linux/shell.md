# 人生中第一个shell
把文件夹内部的文件名重命名的一个脚本
```shell
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
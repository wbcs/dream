# fstream
```c++
#include<fstream>
```

## open file
fstream模块中包含三种类型：`fstream`、`ostream`、`istream`，其对象的open都可以实现文件的打开操作，将数据流和文件进行关联。
```c++
void open(const char filename, ios_base::openmode mode = ios_base::in | ios_base::out);
```
> ios_base：input & output stream的基类。

打开mode有一下几种方式：
+ ios_base::in 为读入而打开
+ ios_base::out 为写入而打开
+ ios_base::ate 初始位置是文件尾部
+ ios_base::app 所有输出append
+ ios_base::trunc 如果文件存在，先干掉
+ ios_base::binary 二进制
> 它们可以组合使用，通过|连接。

比如我要以写的方式打开一个二进制文件：
```c++
int main() {
  fstream fs;
  fs.open("./binary.ext", ios::out | ios::binary);
  // ....
}
// 可以简写为：
fstream fs("./binary.ext", ios::out | ios::binary);
```
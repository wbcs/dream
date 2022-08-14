# inline function

所谓**内敛函数**，就是在实际执行到函数调用的时候，用函数体内的代码替换对应的函数调用语句。这么做的目的就是提高效率，节省了函数调用的开销。

# 用法

```c++
#include<iostream>
using namespace std;

inline void test() {
  cout << "This is a inline function." << endl;
}
int main() {
  test();
  return 0;
}
```

真正执行时的代码：

```c++
#include<iostream>
using namespace std;

inline void test() {
  cout << "This is a inline function." << endl;
}
int main() {
  cout << "This is a inline function." << endl;
  return 0;
}
```

# tip

只有当函数体足够小的时候才能把它定义为内敛函数。

而且不是声明为内敛函数就一定会被编译器内敛的，比如递归函数、虚函数就不会被展开。因为递归不是简单的展开就可以的，而且在编译阶段也不知道函数具体的执行次数。

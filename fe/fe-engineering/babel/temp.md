babel 的处理步骤：parse => transform => generate

parse: 词法分析 => 语法分析
+ 词法分析：string => token stream。其实就是对每个单词、标识符、运算符等等整成一个数组，每个数组的元素就是对这些基本的单位的描述
+ 语法分析：token strem => AST

transform: 接收AST进行遍历（这个过程会对AST进行一些操作）

generate: 经过transform后得到的新的AST，深度优先遍历整个AST，生成转换后的代码
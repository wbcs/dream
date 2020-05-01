`V8`中对于string的几个结论：
+ `V8`内部有一个`string_table`缓存了所有的string，当对`AST`进行转换的时候，每遇到一个string，就会根据这个string换算出一个`hash`并插入到`hashmap`中。在此之后，如果遇到`hash`相同的string，如果string相同，则不会生成新的string。
+ 缓存字符串的时候会分为以下三种情况：
  + `str.length === 1`
  + `str.length >= 2 && str.length <= 10`，并且其值为小于`2^32 - 2`的纯数字字符串
  + 其他string
> 以上string的区别，只会影响生成`hash`的方式，对于第二种类型的string，会先将其转换为对应的number之后再计算`hash`。
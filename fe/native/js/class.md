# class

基本用法就不赘述了，没意思。先说说 `class` 跟 `ES5` 的一些区别的吧。

# class 和 ES5 之间的区别

- `module` 跟 `class` 内的代码默认都是严格模式(`'use strict;'`)。
- 不存在变量提升，类似于 `const let`。
- `class` 内的方法是**不可枚举**的。
- `class`只能通过`new`来调用，而`function`则不然。

# ES6 => ES5

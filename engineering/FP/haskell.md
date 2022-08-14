## 语法

### 类型

- `Bool`
- `Int` `2^31 - 1 ~ 2^31` (针对 32 来讲)
- `Word` 无符号整数
- `Integer` 任意范围整数，类似 JS 中的 BigInt
- `Float`
- `Double`
- `Rational` 有理数
- `Char`
- `String`
- `Tuple` (fst, snd)
- `List`
  - x:xs x 是元素 xs 是一个列表，x 也代表了某个类型，比如 x 是 Bool 那 xs 就是 Bool 类型的 list。
  - head 取 list 的第一个元素，为空则报错

类型系统的优点：

- 类型检查
- 文档 提高程序的可读性、可维护性
- 程序的抽象

### 类型类

具有相似属性的不同类型的集合成为类型类，这些类型都能够实现特定的函数。类型通过实现特定的函数来加入到某个类型类中。例如：Num、Show、Ord、Eq 等

- `Enum`
  - start~end `[start..end]`
  - x 的前一个元素 `pred x`
  - x 的后一个元素 `succ x`
- `Bounded`
  - 最大边界 `maxBound::Type`
  - 最小 `minBound::Type`

### 函数

> 在 Haskell 中可以说是一切皆函数

```haskell
add :: Num a => a -> a
add (x, y) = x + y
```

#### curried function

科里化函数(`curried function`), 当函数存在多个参数的时候，在参数不足时返回一个函数作为结果，这样的函数叫作科里化函数。

> 可以把函数的参数看作是 tuple，给函数传递参数的过程可以看作是一次性就给出 tuple 还是每次只给一个 tuple 的元素。这两者是等价并且可以相互转化的。

将函数转换为科里化函数的过程叫作科里化（`curry`），反之为非科里化(`uncurry`)。

> `curry :: ((a, b) -> c) -> a -> b -> c` <br /> > `uncurry :: (a -> b -> c) -> (a, b) -> c `

#### lambda

lambda 也叫匿名函数：

```hs
let fn = \x -> \y -> x + y
```

```js
const fn = (x, y) => x + y;
```

```hs
-- type definition
add :: Num a => a -> a -> a
-- body definition
add x y = x + y
add = \x -> \y -> x + y
add = \x y -> x + y -- x y 之间的空格不能省
```

- alpha 替换: 在没有命名冲突的前提下，可以将参数的名称重命名
- beta 简化: 在没有命名冲突的前提下，可以将应用参数与函数体中的参数替换
- η 化简:

```hs
-- alpha 替换
add = \x -> \y -> x + y
=> add = α \a -> \y -> a + y
-- beta 简化
(\x -> \y -> x y)(abs)(-5)
=> β (\y -> abs y)(-5)
=> β (β (abs -5))
=> β (abs -5)
-- η 化简
g :: (Num a, Word b) => a -> b
g = \x -> abs x
=> g = abs
```

> η 化简的时候尽量标注函数类型前面，防止 **单一同态限定** 造成的一些问题。

- 单一同态限定
  - 避免重复计算
  - 消除类型歧义

```hs
switch0 n = case n of
  0 -> "False"
  1 -> "True"
  _ -> "Fuck"

switch1 0 = "False"
switch1 1 = "True"
switch1 _ = "Fuck"

isTwo n = if n == 2 then True else False

_abs n | n >= 0 = n
  | otherwise = -n

-- 自定义运算符
-- infix, infixl, infixr 分别是无、左、右结合
-- 后面紧跟的是优先级、要定义的运算符
infixl 5 <+>, <->
-- 运算符作用的类型类
(<+>), (<->) :: Num a => a -> a -> a
(<+>) x y = x + y
(<->) x y = x - y


fn = \x -> x
fn' = \x -> x -- 如果已经定义 需要加个 '
```

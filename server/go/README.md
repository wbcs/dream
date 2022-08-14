# go 中的变量声

## 变量声明

```go
var my_var int = 1
// 自动进行类型推导
var my_val = 1
// 声明并初始化的简写
my_val := 1
var (
  var0 int = 1
  str0 string = "str"
  rune0 rune = 's'
)
```

常量类似，var 变 const 即可。

> 不可重复声明、没有变量提升

## 变量作用域

go 里面的变量能在三个地方声明：

- 函数内部：局部变量
- 函数外部：全局变量
- 形参处

```go
var name = "wbingcs"
func main() {
  var name = "bruce"
  println(name)
}
```

和 js 一样，不说了。还有一点就是，它是有块级作用域的。

# go 中的函数

```go
func func_name(arg int)(int, string, rune) {
  return 1, "str", 'c'
}
```

和`js`的`function`不一样的是，它能`return`多个返回值

## go 中的 FP 支持：

```go
fn := func(num0 int, num1 int) int {
  return math.Sqrt(num0 + num1)
}
```

## go 中的闭包

```go
fn := func() int{
  i := 0
  return func() {
    return i++
  }
}
```

和`js`中的基本一样

# go 中的对象

```go
type Person struct {
  age int
  name string
}
func (this Person)get_name() string{
  return this.name
}
func main() {
  person := Person {
    age: 20,
    name: "wbingcs",
  }
}
```

## 数组对象

```go
var arr = [...]int{1, 2}
var arr [10]int
arr := [...]int{1,3}
```

多维：

```go
var arr [2][2]int
arr := [2][2]int {
  {1,2},
  {3,4},
}
```

数组作为参数

```go
func sum(arr [3]int) int{
  sum := 0
  for _, item := range arr {
    sum += item
  }
  return sum
}
arr := [3]int {1,3,4}
sum(arr)
```

或者

```go
func main() {
  arr := []int {1,2,3,4}
  println(sum(&arr))
}
func sum(arr *[]int) int {
  sum := 0
  for _, item := range *arr {
    sum += item
  }
  return sum
}
```

> 需要注意的一点是，go 中的数组在直接进行赋值的时候是值拷贝。对象也是值拷贝

## slice

```go
var slice []int  // 不指定length
var slice0 []int = make([]int, 10)
slice1 := make([]int, 10)
```

还可以用数组来制造切片，类似 js 中的 slice

```go
arr := [5]int {1,2,3,4,5}
slice := arr[0, 6]
```

要扩充 cap 或者 length 直接使用 append 就可以了:

```go
s := []int {1,2,3} // len 3, cap 3
s = append(s, 1) // len 4, cap 6
```

append 的效果就是，只要 length 不大于 cap 就直接新增元素即可。一旦 length 大于 cap，cap 会变为原来的 2 倍

## map

```go
map0 := map[string][string] = {
  "key": "value"
}
// 或者
map0 := make(map[string]string)
map0["key"] = "value"
```

删除：

```go
delete(map0, "key")
```

> 可以发现 go 和 js 的一个很大不同，js 的函数都是方法，在特定对象上调用。而 go 的功能性函数都是全局的函数，通过传递参数来执行对应的功能。

# tips

go 中的数组

```go
arr := [...]int{1,2,3,4}
arr := [4]int{1,2,3,4}
```

> 和 js 不同的是，数组居然踏马的是值拷贝

和 js 中对应的，更接近的应该是 slice，切片：

```go
arr := [...]int{1,23,456}
// start,end和js中的slice一样
slice := arr[start:end]
```

slice 和数组很像，但是是引用传值的.并且能够像 js 那样无限 push（go 里叫 append）

它的类型系统和 ts 都是后置，不过直接写就行了，不需要写:

# 总结

go 中的类型有：

- number: `int int8 int16 int32 uint uint8 uint16 uint32`， `byte`, `float float32 float64`, `rune`
- char/string: `rune`, `string`。其实 go 中没有真正意义的字符型，rune 只是 int32 的别名罢了,byte 只是 uint 的别名
- 指针类型： `type*`
- 引用类型：`slice`, `map`
- 其他：`数组`,`函数`

# go中的变量声
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
常量类似，var变const即可。
> 不可重复声明、没有变量提升

## 变量作用域
go里面的变量能在三个地方声明：
+ 函数内部：局部变量
+ 函数外部：全局变量
+ 形参处
```go
var name = "wbingcs"
func main() {
  var name = "bruce"
  println(name)
}
```
和js 一样，不说了。还有一点就是，它是有块级作用域的。

# go中的函数
```go
func func_name(arg int)(int, string, rune) {
  return 1, "str", 'c'
}
```
和`js`的`function`不一样的是，它能`return`多个返回值

## go中的FP支持：
```go
fn := func(num0 int, num1 int) int {
  return math.Sqrt(num0 + num1)
}
```
## go中的闭包
```go
fn := func() int{
  i := 0
  return func() {
    return i++
  }
}
```
和`js`中的基本一样

# go中的对象
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

# tips

go中的数组
```go
arr := [...]int{1,2,3,4}
arr := [4]int{1,2,3,4}
```
> 和js不同的是，数组居然踏马的是值拷贝

和js中对应的，更接近的应该是slice，切片：
```go
arr := [...]int{1,23,456}
// start,end和js中的slice一样
slice := arr[start:end]
```
slice和数组很像，但是是引用传值的.并且能够像js那样无限push（go里叫append）

它的类型系统和ts都是后置，不过直接写就行了，不需要写:
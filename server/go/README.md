# tips
+ =是赋值，:=声明并初始化
+ rune是int32的别名

go中的对象：
```go
func fn() {
  type Person struct {
    name string
    age int
  }
  const wb = Person {
    name: "wbingcs",
    age: 22,
  }
}
```
> 对象最后的,还不能省略，我日

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
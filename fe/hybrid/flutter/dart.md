# Dart

Pubspec.yaml 相当于 package.json 里面的 dependences 就是项目的依赖 cmd + s 自动下载

# 类型

## 基本类型

`int、double、string、bool、null`等

## 函数

```dart
int fn() {
  return 0;
}
// 可以简写为
int fn() => 0;
```

## 对象

```dart
const obj = {
  'key': 'some string value'
};

// 和js中的对象不同，key只能是字符串。如果不带引号，会把对应的变量内容作为key：
const key = 'KEY';
const obj = {
  key: 10
};
obj.toString(); // {KEY: 10}

// 而且如果object用const声明的话，对应的key和value也必须是const的（要么是用const声明的，要么是常量）
const key = 'name';
const name = 'Bruce'
var obj = {
  key: name
};
```

## 数组

```dart
List l = new List();
// or
final l = [];
```

# 定义变量

`var、int、double、bool、const、final`
dart 中的变量和 js 中的 let、const 声明的变量都有 TDZ 这个特性，但是函数没有。

> `var`确定类型后不能赋值为和原先不同类型的值；`const`和`final`的区别是，`const`必须初始为一个常量，而`final`可以用变量来初始化（因为`const`是在与解析阶段就被赋值了）
>
> > 简单理解，dart 中的 final 和 js 中的 const 一样，dart 中的 const 是表示完全不变的（不仅仅是引用）。

# 流程控制

只有 bool 类型能够用于 if 判断

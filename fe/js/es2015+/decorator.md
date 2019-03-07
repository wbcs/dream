# 前言
`JavaScript` 装饰器一共有4种：
+ method Decorator
+ property Decorator
+ Class Decorator
+ Parameter Decorator

# method Decorator
```ts
class MyClass {
  @Decorator
  method() {

  }
}

function Decorator(target: any, key: string, descriptor: PropertyDescriptor) {
  target === MyClass.prototype; // true
  // 会在MyClass被声明的时候调用，而不是new 或者实例调用方法的时候调用
}
```

# property Decorator
```ts
class MyClass {
  @Decorator
  method() {

  }
}

function Decorator(target: any, key: string) {
  target === MyClass.prototype; // true
}
```


# class Decorator

```ts
@Decorator
class MyClass {
  
}

function Decorator(targe) {
  // MyClass === target
}
```

# params Descorator
```ts
class MyClass {
  say(@Decorator arg) {

  }
}

function Decorator(target, methodKey, argNum) {
  // target === MyClass.prototype
  // methodKey === 'say'
  // argNum 就是第几个参数，这里是0
}
```

# 总结
其实没啥说的，装饰器的本质就是修改 `descriptor` 。只不过这个修改的 `function` 是在 `class` 声明的时候执行的而已。
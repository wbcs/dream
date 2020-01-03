# intro
infer的意思为待推断。
```ts
type ParamType<T> = T extends (arg: infer P) => void ? P : T;
```
如果 `T` 能赋值给 `(arg: infer P) => void`, 那就相当于 `T = P`, 否则 `T = T`
```ts
type Fn = (arg: number) => void
// CurrentType 是 number
type CurrentType = ParamType<Fn>
// CurrentType 是 string
type CurrentType = ParamType<string>
```

# 内置类型
+ ReturnType: 获取函数return的类型
+ ConstructorParameters: 获取构造函数参数类型
+ InstanceType: 获取实例的类型
```ts
type ReturnType<
  T extends (...args: any[]) => any
> = T extends (...args: any[]) => P ? P : any
// string
type TReturn = ReturnType<() => string>

type ConstructorParameters<
  T extends new (...args: any[]) => any
> = T extends new (...args: infer P) ? P : never

class TestClass {
  constructor(name: string, age: number) {
  }
}
// [string, number]
type TConstructor = ConstructorParameters<typeof TestClass>

type InstanceType<
  T extends new (...args: any[]) => any
> = T extends new (...args: any[]) => infer P ? P : any
// TestClass
type TIns = InstanceType<typeof TestClass>
```

# 应用
有了infer就能够提取到一些类型了，比如：
```ts
type T = Record<
  string, 
  Record<number, boolean>
>
type TRecordSecondType<T extends Record<any, any>> = T extends Record<string, infer P> ? P : any

// Record<number, boolean>
type T2 = TRecordSecondType<T>
```
是不是很屌？嘎嘎

再比如一个蛮屌的提取Tuple的`（[number,string] => number|string）`：
```ts
type TTuple = [number, string, boolean]
type TRes = TTuple[number]

// 当然也能用infer：
type TupleType<T extends Array<any>> = T extends Array<infer P> ? P : any
type TRes = TupleType<TTuple>
```

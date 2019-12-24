# is特性
先来看一段代码
```ts
const isString = (val: any): val is string => typeof val === 'string'

const strOrNull: string | null = ''
if (isString(strOrNull)) {
  strOrNull.toUpperCase();
}
```
很简单明了，`ts` 编译器能够判断出来 `strOrNull` 是`string`，然后执行`toUpperCase`就不会报错。

那很有可能不知道`is`的同学就会直接写成`boolean`：
```ts
const isString = (val: any): boolean => typeof val === 'string'
const strOrNull: string | null = ''
if (isString(strOrNull)) {
  // 即使条件为true，ts编译器依然会报错误：strOrNull有可能是null这种错误
  strOrNull.toUpperCase();
}
```

> 学会了`is`，再看见公司有人在该用`is`的情况下写`boolean`，就可以嘲讽一波了😀

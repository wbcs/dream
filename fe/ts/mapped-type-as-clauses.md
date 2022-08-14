# 映射类型 as 子句

```ts
type Getter<T> = {
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K];
};

// type Mapped = {
//   getName: () => string;
//   getAge: () => number;
// }
type Mapped = Getter<{ name: string; age: number }>;

type MapUnionLiteral<T> = {
  [K in keyof T & string as
    | `get${Capitalize<K>}`
    | `set${Capitalize<K>}`
    | `remove${Capitalize<K>}`]: T[K];
};

// {
//   getName: string;
//   setName: string;
//   removeName: string;
//   getAge: number;
//   setAge: number;
//   removeAge: number;
// }
MapUnionLiteral<{ name: string; age: number }>;
```

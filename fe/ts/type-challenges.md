- simple

  - Pick:

  ```ts
  type MyPick<T, K extends keyof T> = {
    [k in K]: T[k];
  };
  ```

  - ReadOnly:

  ```ts
  type MyReadOnly<T> = {
    readonly [k in keyof T]: T[k];
  };
  ```

  - 元组转换为对象:

  ```ts
  type TupleToObject<T extends readonly (string | number)[]> = {
    [k in T[number]]: k;
  };
  ```

  - 第一个元素:

  ```ts
  type First<T extends any[]> = T extends [infer U, ...infer reset] ? U : never;
  ```

  - 获取元组长度:

  ```ts
  type Length<T extends any[] | readonly any[]> = T['length'];
  ```

  - Exclude:

  ```ts
  type MyExclude<T, U> = T extends U ? never : T;
  ```

  - Awaited:

  ```ts
  type Awaited<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
  ```

  - If:

  ```ts
  type If<C extends boolean, T, F> = C extends true ? T : F;

  ``;
  ```

  - Concat:

  ```ts
  type Concat<T extends any[], U extends any[]> = [...T, ...U];
  ```

  - Include:

  ```ts
  // @TODO 为什么不对？？
  type Includes<T extends readonly any[], U> = T extends [
    infer First,
    ...infer Rest
  ]
    ? First extends U
      ? true
      : Includes<Rest, U>
    : false;
  ```

- medium

  - ReturnType:

  ```ts
  type MyReturnType<T extends CallableFunction> = T extends (
    ...args: any[]
  ) => infer U
    ? U
    : never;
  ```

  - Omit:

  ```ts
  type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
  ```

  - ReadOnly2:

  ```ts
  type MyReadonly2<T, K extends keyof T = keyof T> = Readonly<Pick<T, K>> &
    Pick<T, Exclude<keyof T, T>>;
  ```

  - DeepReadonly

  ```ts
  type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends Record<any, unknown>
      ? DeepReadonly<T[K]>
      : T[K];
  };
  ```

  - TupleToUnion

  ```ts
  type TupleToUnion<T> = T extends [infer First, ...infer Rest]
    ? First | TupleToUnion<Rest>
    : never;
  ```

  - Last

  ```ts
  type Last<T extends any[]> = T extends [infer L, ...infer Rest]
    ? Rest extends []
      ? L
      : Last<Rest>
    : never;
  ```

  - Pop

  ```ts
  type Pop<T extends any[]> = T extends []
    ? T
    : T extends [infer First, ...infer Rest]
    ? Rest extends []
      ? Rest
      : [First, ...Pop<Rest>]
    : never;

  type Push<T extends any[], E extends any> = [...T, E];

  type Shift<T extends any[]> = T extends [infer First, ...infer Rest]
    ? Rest
    : never;

  type Unshift<T extends any[], E extends any> = [E, ...T];
  ```

  - PromiseAll

  ```ts
  declare function PromiseAll<T extends Readonly<any[]>>(
    values: Readonly<[...T]>
  ): Promise<
    {
      [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
    }
  >;
  ```

  - LookUp

  ```ts
  type LookUp<U, T> = U extends { type: T } ? U : never;
  ```

  - TrimLeft

  ```ts
  type TrimLeft<S extends string> = S extends `${
    | ' '
    | '\n'
    | '\t'}${infer Rest}`
    ? TrimLeft<Rest>
    : S;

  // 或者
  type TrimLeft<S extends string> = S extends `${infer Alpha}${infer Rest}`
    ? Alpha extends ' ' | '\n' | '\t'
      ? TrimLeft<Rest>
      : `${Alpha}${Rest}`
    : never;
  ```

## @TODO

- 为什么 `() => void` 可以赋值给 `Record<any, any>` 但不可以给 `Record<any, unknown>`
- 为什么

```ts
type TrimLeft<S extends string> = S extends `${infer Alpha}${infer Rest}`
  ? Alpha extends ' ' | '\n' | '\t'
    ? TrimLeft<Rest>
    : `${Alpha}${Rest}`
  : never;
```

## 学到的东西

- 遍历数组和遍历对象一样：

```ts
type Type<T> = {
  [K in keyof T]: T[K];
};
```

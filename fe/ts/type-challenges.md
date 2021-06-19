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
  // @TODO
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

- middle

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

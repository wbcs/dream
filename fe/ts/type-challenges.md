### simple

- [x] <img src="https://img.shields.io/badge/-4%E3%83%BBPick-7aad0c" alt="4・Pick"/>

```ts
type MyPick<T, K extends keyof T> = {
  [k in K]: T[k];
};
```

- [x] <img src="https://img.shields.io/badge/-7%E3%83%BBReadonly-7aad0c" alt="7・Readonly"/>

```ts
type MyReadOnly<T> = {
  readonly [k in keyof T]: T[k];
};
```

- [x] <img src="https://camo.githubusercontent.com/b82681835909523cd3681a02cee4b1fa9153776fdec8205698a5897ee20f7e7f/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d31312545332538332542425475706c65253230746f2532304f626a6563742d376161643063" alt="11・Tuple to Object" >

```ts
type TupleToObject<T extends readonly (string | number)[]> = {
  [k in T[number]]: k;
};
```

- [x] <img src="https://camo.githubusercontent.com/db055f8d27d1a1ed52faa3b152a7177d067813d504b3001f653409317db7dd91/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d313425453325383325424246697273742532306f6625323041727261792d376161643063" alt="14・First of Array" >

```ts
type First<T extends any[]> = T extends [infer U, ...infer reset] ? U : never;
```

- [x] <img src="https://camo.githubusercontent.com/88123c3a693459ca46d0cec08df66ce20e1161e7f3b478cbc9f3a7ce096f5030/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d31382545332538332542424c656e6774682532306f662532305475706c652d376161643063" alt="18・Length of Tuple" >

```ts
type Length<T extends any[] | readonly any[]> = T['length'];
```

- [x] <img src="https://camo.githubusercontent.com/8c39b93cd351065cc0fae36700c60ad0168f5693db14740fdfddb85f0656c4d3/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d34332545332538332542424578636c7564652d376161643063" alt="43・Exclude">

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

- [x] <img src="https://camo.githubusercontent.com/4204aad9157ea379739a283293e60bb14f54265645035173dcc8b964490dc237/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d313839254533253833254242417761697465642d376161643063" alt="189・Awaited" />

```ts
type Awaited<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
```

- [x] <img src="https://camo.githubusercontent.com/0b9059d4407b659a841e39cb83e04903c98ebef8aa19ae50e64f47242f3ca91f/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d32363825453325383325424249662d376161643063" alt="268・If"  />

```ts
type If<C extends boolean, T, F> = C extends true ? T : F;
```

- [x] <img src="https://camo.githubusercontent.com/e42704ed37d72263a6ae709d70834a20d29ceaabff4d712b4a37c7f1243521e2/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d353333254533253833254242436f6e6361742d376161643063" alt="533・Concat" />

```ts
type Concat<T extends any[], U extends any[]> = [...T, ...U];
```

- [ ] <img src="https://camo.githubusercontent.com/40c7ae052fcc07b2479d973e56d815adeaca26142d3d0dfd556b0b6b26fbb2cf/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d383938254533253833254242496e636c756465732d376161643063" alt="898・Includes" >

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

### medium

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
): Promise<{
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
}>;
```

- LookUp

```ts
type LookUp<U, T> = U extends { type: T } ? U : never;
```

- TrimLeft

```ts
type TrimLeft<S extends string> = S extends `${' ' | '\n' | '\t'}${infer Rest}`
  ? TrimLeft<Rest>
  : S;

// 或者
type TrimLeft<S extends string> = S extends `${infer Alpha}${infer Rest}`
  ? Alpha extends ' ' | '\n' | '\t'
    ? TrimLeft<Rest>
    : `${Alpha}${Rest}`
  : never;
```

- StringToTuple

```ts
type StringToTuple<S extends string> = S extends `${infer Alpha}${infer Rest}`
  ? [Alpha, ...StringToTuple<Rest>]
  : [];

type LengthOfString<S extends string> = StringToTuple<S>['length'];
```

### hard

- [x] <img src="https://camo.githubusercontent.com/02b5863bc5c91d63f76326905a0fbad21790d6182a437efd2b624df66faf60a6/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d3625453325383325424253696d706c652532305675652d646533643337" alt="6・Simple Vue" />

```ts
type MapComputed<C> = {
  [K in keyof C]: C[K] extends () => infer R ? R : never;
};

type Options<D, C, M, MapedC, This = ThisType<MapedC & D & M>> = {
  data: (this: null) => D;
  computed?: C & This;
  methods?: M & This;
};

declare function SimpleVue<
  D,
  C,
  M,
  MapedC = MapComputed<C>,
  This = ThisType<MapedC & D & M>
>(options: Options<D, C, M, MapedC>): D & MapedC & (M & This);
```

- [x] <img src="https://camo.githubusercontent.com/290418811a4f4dbcbfd348a6bee7afd3bfbf7f1de855fd8c9c566ad07b733c53/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d383437254533253833254242537472696e672532304a6f696e2d646533643337" alt="847・String Join" >

```ts
type Join<T, D extends string> = T extends string[]
  ? T extends [infer Alpha, ...infer Rest]
    ? Rest extends []
      ? Alpha
      : `${Alpha & string}${D}${Join<Rest, D>}`
    : ''
  : never;

declare function join<T extends string>(
  delimiter: T
): <U extends string[]>(...parts: U) => Join<U, T>;
```

- [x] <img src="https://camo.githubusercontent.com/f7d8061636ad216b5a17c533b2fa23b0ccd7914d025fd67a3834b00466faadb1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d353725453325383325424247657425323052657175697265642d646533643337" alt="57・Get Required" />

```ts
type GetRequired<T> = {
  [K in keyof T]-?: { [k in K]?: T[k] } extends { [k in K]: T[k] }
    ? never
    : {
        [k in K]: T[K];
      };
}[keyof T];
```

- [x] <img src="https://camo.githubusercontent.com/a2f34dc06f0a3c78e00086adb28081fce708fc1bee0b7d272d95fd4fc648cc88/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d3133383325453325383325424243616d656c697a652d646533643337" alt="1383・Camelize" />

```ts
type CamelizeKey<K extends string> = K extends `${infer Alpha}_${infer Beta}`
  ? `${Alpha}${Capitalize<Beta>}`
  : K;

type Camelize<T extends Record<any, any>> = {
  [K in keyof T as K extends string ? CamelizeKey<K> : K]: T[K] extends Record<
    any,
    any
  >
    ? Camelize<T[K]>
    : T[K];
};
```

- [x] <img src="https://camo.githubusercontent.com/6575f7242a63e3f575f80e362f57be188a8a8ac52cf985733ea1ea59a62c6760/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d3132393025453325383325424250696e69612d646533643337" alt="1290・Pinia" />

```ts
type MapGetters<T> = {
  [K in keyof T]: T[K] extends () => infer R ? R : T[K];
};

type ObjectDescriptor<S, G, A> = {
  id: string;
  state: () => S;
  getters?: G & ThisType<S & MapGetters<G> & A>;
  actions?: A & ThisType<S & MapGetters<G> & A>;
};

declare function defineStore<S, G, A>(
  parameters: ObjectDescriptor<S, G, A>
): S & MapGetters<G> & A;
```

never 和 其他类型 & 会直接被消除掉

> `{key?: 'fuck'}` 和 `{key: undefined}` 的区别是啥

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

- key as 后面可以 + 表达式：

```ts
type Hehe<T> = {
  [K in keyof T as K extends 'fuck' ? K : never]: T[K];
};
```

- 可以在函数前加泛型来实现类似 infer 的效果

```ts
type ObjProps<name, age> = {
  name: name;
  age: age;
};
declare function mapObjProps<name, age>(
  args: ObjProps<name, age>
): {
  newName: name;
  newAge: age;
};

// {
//   newName: "wb",
//   newAge: 23,
// }
const obj = mapObjProps({
  name: 'wb',
  age: 23,
});
```

- ThisType: 类似 Vue

```ts
type MapGetters<T> = {
  [K in keyof T]: T[K] extends () => infer R ? R : T[K];
};

type ObjectDescriptor<S, G, A> = {
  id: string;
  state: () => S;
  getters?: G & ThisType<S & MapGetters<G> & A>;
  actions?: A & ThisType<S & MapGetters<G> & A>;
};

declare function defineStore<S, G, A>(
  parameters: ObjectDescriptor<S, G, A>
): S & MapGetters<G> & A;

const obj = defineStore({
  id: 'fuck',
  state: () => ({
    words: ['fuck', 'you', 'bitch'],
    num: -1,
  }),
  getters: {
    getStringifyWords() {
      return this.words.join(',');
    },
  },
  actions: {
    setNum(num: number) {
      this.num = num;
      return true;
    },
  },
});

const words = obj.getStringifyWords;
const isSuccess = obj.setNum(123);
```

- extends 会将联合类型展开，即 conditional distribution：

```ts
type Ref<T> = { current: T };
type ConditionalWrapper<T> = T extends any ? Ref<T> : never;

// {current: 1|2}
type a = Ref<1 | 2>;
// {current: 1} | {current: 2}
type b = ConditionalWrapper<1 | 2>;
```

- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types

- extends 后面针对多个相同类型做 infer，最终会推导为 intersection：

```ts
type User = { age: number } | { name: string };
type UnionToIntersection<T> = (
  T extends any ? (arg: T) => void : never
) extends (arg: infer U) => void
  ? U
  : any;

// 会被推导为 { age: number } & { name: string };
type Wb = UnionToIntersection<User>;
```

- 比较两个数字：

```ts
type MakeTuple<U extends number, T extends any[] = []> = T['length'] extends U
  ? T
  : MakeTuple<U, [any, ...T]>;

type IsGt<T extends number, U extends number> = T extends U
  ? false
  : Reduce<U, MakeTuple<T>>;

type Reduce<U extends number, T extends any[] = []> = T['length'] extends U
  ? true
  : T['length'] extends 0
  ? false
  : T extends [infer Alpha, ...infer Rest]
  ? Reduce<U, Rest>
  : never;

type Compare<T extends number, U extends number> = T extends U
  ? 0
  : IsGt<T, U> extends true
  ? 1
  : -1;

// 1
type shouldBe1 = Compare<40, 5>;
// 0
type shouldBe0 = Compare<5, 5>;
// -1
type shouldBe_1 = Compare<1, 500>;
```

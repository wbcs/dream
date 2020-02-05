enum FooIdBrand {
  _ = ''
}
type FooId = FooIdBrand & string;

// BAR
enum BarIdBrand {
  _ = ''
}
type BarId = BarIdBrand & string;

let fooId: FooId;
let barId: BarId;

// 类型安全
fooId = barId; // error
barId = fooId; // error

// 创建一个新的
fooId = 'foo' as FooId;
barId = 'bar' as BarId;

// 两种类型都与基础兼容
let str: string;
str = fooId;
str = barId;

import React from 'react'
interface Shit<T , S> {
  prop0: T
  prop1: S
}
class Fuck<T, S> extends React.Component<Shit<T, S>> {
  constructor(props) {
    super(props)
  }
}

const obj = new Fuck<string, number>({
  prop0: '',
  prop1: 0
})

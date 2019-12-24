
interface Person {
  age: number
}
interface Person {
  name: string
}

type A = Person

const obj: Person = {
  age: 1,
  name: ''
}
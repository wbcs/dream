获取链表倒数第n个结点：
```ts
type LNode = {
  data: any;
  next: LNode | null;
}

function findNth(list: LNode, n: number): LNode | null {
  let counter = 0
  let p = list
  while (counter < n && p) {
    p = p.next
    counter++
  }
  if (counter === n && !p) {
    return list
  }
  if (counter < n) return null
  while (p) {
    p = p.next
    list = list.next
  }
  return list
}
```
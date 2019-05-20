# 删除链表的倒数第n个结点, 并返回头结点
我的思路，遍历链表的时候，对单个结点再向后遍历n次，如果n次之后的结点的next是null，则说当前结点就是倒数第n + 1个结点：
```ts
class ListNode {
  val: any
  next: ListNode
}

function removeNthFromEnd(head, n) {
  let node = head;
  while (node) {
    let p = node;
    for (let i = 0; i < n; i ++) {
      p = p.next;
    }
    // 说明head就是倒数第n个结点
    // 因为在n一定是有效的前提下，如果head不是倒数n个结点，
    // 那p一定不会null
    if (!p) {
      return head.next;
    }
    // 说明node是倒数第n + 1个结点
    if (!p.next) {
      break;
    }
    node = node.next;
  }
  node.next = node.next.next;
  return head;
}
```
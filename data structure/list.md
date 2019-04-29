# 合并两个有序顺序表
```js
const listA = [0, 2, 4, 7];
const listB = [1, 3, 5, 8, 10];

function merge(listA, listB) {
  const list = [];
  let i, j;
  for (i = j = 0; i < listA.length && j < listB.length;) {
    if (listA[i] <= listB[j]) {
      list.push(listA[i ++]);
    } else {
      list.push(listB[j ++]);
    }
  }
  if (i > listA.length) {
    list.push(...listA.slice(i));
  } else {
    list.push(...listB.slice(j));
  }
  return list;
}
```

# 链式存储
```js
class LNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class List {
  constructor(list) {
    this.head = new LNode(0);
    list.forEach(node => {
      this.append(node);
    });
  }
  append(data) {
    const node = new LNode(data);
    let p = this.head;
    while (p.next) {
      p = p.next;
    }
    p.next = node;
    this.head.data ++;
  }
  removeAt(index) {
    if (index < 0 || index >= this.head.data) return false;
    let counter = 0;
    let p = this.head.next;
    while (p && counter < index - 1) {
      p = p.next;
    }
    if (!p) return false;
    p.next = p.next.next;
    return true;
  }
  indexOf(data) {
    let index = 0;
    let p = this.head.next;
    while (p && p.data !== data) {
      p = p.next;
      index ++;
    }
    return !p ? -1 : index;
  }
  toString() {
    let str = '';
    let p = this.head.next;
    while (p) {
      str += p.data.toString() + (p.next ? '=>' : '');
      p = p.next;
    }
    return str;
  }
}

const l = new List([0, 50, 20, 80]);
console.log(l.toString());
l.removeAt(1);
console.log(l.toString());

```
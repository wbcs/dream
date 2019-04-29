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
## 单链表
```js
class LNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkList {
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
  insert(index, data) {
    let p = this.head;
    for (let i = index - 1; i >= 0 && p; i --) {
      p = p.next;
    }
    if (!p) {
      this.append(data);
    } else {
      const node = new LNode(data);
      node.next = p.next;
      p.next = node;
    }
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
    this.head.data --;
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
      str += p.data.toString() + (p.next ? '->' : '');
      p = p.next;
    }
    return str;
  }
}
```

## 双向链表
```js
class DLNode {
  constructor(data) {
    this.data = data;
    this.prev = this.next = this;
  }
}

class DoubleLinkList {
  constructor(list) {
    this.head = new DLNode(0);
    list.forEach((item, index) => {
      this.insert(index, item);
    });
  }
  insert(index, data) {
    // index大于length，则append到最后
    if (index < 0) return false;
    const node = new DLNode(data);
    let p = this.head.next;
    for (let i = 0; i < index && p !== this.head; i ++) {
      p = p.next;
    }
    node.next = p;
    node.prev = p.prev;
    p.prev.next = node;
    p.prev = node;
    this.head.data ++;
    return true;
  }
  remove(index) {
    if (index >= this.head.data || index < 0) return false;
    let p = this.head.next;
    for (let i = 0; i < index; i ++) {
      p = p.next;
    }
    p.prev.next = p.next;
    p.next.prev = p.prev;
    this.head.data --;
    return true;
  }
  toString() {
    let p = this.head.next;
    let str = '';
    while (p !== this.head) {
      str += p.data + '->';
      p = p.next;
    }
    return str;
  }
}
```
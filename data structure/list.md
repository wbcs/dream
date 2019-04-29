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
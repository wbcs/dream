/**
 * 最小堆 是一种经过排序的完全二叉树
 * 非终端结点不能大于其左右子节点
 *
 * 定时任务、任务调度等场景经常会用到
 *
 * 在阅读 React Scheduler 的时候发现 React 的优先级调度也是基于最小堆的
 * 所以在这里学习一下~
 */

export function MinHeap() {
  return [];
}

export function push(heap, value, indexSort) {
  const index = heap.length;
  const node = new HeapNode(value, indexSort);
  heap.push(node);
  siftUp(heap, node, index);
}

export function pop(heap) {
  const first = heap[0];
  if (isNoop(first)) return null;
  const node = heap.pop();
  if (first === node) return first;
  heap[0] = node;
  siftDown(heap, node);
  return first;
}

export function seek(heap) {
  const first = heap[1];
  return isNoop(first) ? null : first;
}

/**
 * @Utils
 */

let heapIdCount = 1;
function HeapNode(data, indexSort) {
  const id = heapIdCount++;
  return {
    id,
    data,
    indexSort: isNoop(indexSort) ? data : indexSort,
  };
}

function siftUp(heap, node, index) {
  let _index = index;
  while (true) {
    const parentIndex = (_index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (!isNoop(parent) && compare(heap[parentIndex], node) > 0) {
      heap[parentIndex] = node;
      heap[_index] = parent;
      _index = parentIndex;
    } else {
      return;
    }
  }
}

function siftDown(heap, node) {
  let index = 0;
  while (index < heap.length) {
    const leftIndex = index * 2 + 1;
    const rightIndex = leftIndex + 1;
    const left = heap[leftIndex];
    const right = heap[rightIndex];
    if (isNoop(left)) {
      return;
    }
    const [minChild, minChildIndex] =
      isNoop(right) || compare(left, right) < 0
        ? [left, leftIndex]
        : [right, rightIndex];
    if (compare(minChild, node) < 0) {
      heap[minChildIndex] = node;
      heap[index] = minChild;
      index = minChildIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function isNoop(value) {
  return typeof value === 'undefined';
}

function compare(node0, node1) {
  return node0.indexSort - node1.indexSort;
}

function print(heap) {
  console.log(heap.map((item) => item.indexSort).join(','));
}

/**
 * @tests
 */

function __test__() {
  const heap = MinHeap();
  push(heap, 4);
  push(heap, 2);
  push(heap, 1);
  push(heap, 7);
  push(heap, 6);
  push(heap, 8);
  push(heap, 5);
  push(heap, 4);
  push(heap, 4);

  print(heap);
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
  console.log(pop(heap));
}
__test__();

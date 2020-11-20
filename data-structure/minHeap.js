/**
 * 最小堆 是一种经过排序的完全二叉树
 * 非终端结点不能大于其左右子节点
 * 
 * 定时任务、任务调度等场景经常会用到
 * 
 * 在阅读 React Scheduler 的时候发现 React 的优先级调度也是基于最小堆的
 * 所以在这里学习一下~
 */


function Heap() {
  const NOOP = undefined;
  return [NOOP]
}

let heapIdCount = 1
function HeapNode(data, indexSort) {
  const id =  heapIdCount++
  return {
    id,
    data,
    indexSort: isNoop(indexSort) ? id : indexSort
    // other props
  };
}

function push(heap, value, indexSort) {
  let index = heap.length;
  const node = new HeapNode(value, indexSort);
  heap.push(node);
  while (true) {
    let parentIndex = index >>> 1;
    if (parentIndex !== 0) {
      if (compare(heap[parentIndex], heap[index]) > 0) {
        [heap[index], heap[parentIndex]] = [heap[parentIndex], heap[index]];
        index = parentIndex;
      } else {
        return;
      }
    } else {
      return;
    }
  }
}

function pop(heap) {
  if (isEmpty(heap)) return null;
  let firstIndex = 1;
  let lastIndex = heap.length - 1;
  [heap[firstIndex], heap[lastIndex]] = [heap[lastIndex], heap[firstIndex]];
  const node = heap.pop();
  if (isEmpty(heap)) return node;
  let parentIndex = 1;
  while (true) {
    let minChildIndex = getMinChildIndex(heap, parentIndex);
    if (minChildIndex === -1) {
      return node;
    }
    if (compare(heap[parentIndex], heap[minChildIndex]) > 0) {
      [heap[parentIndex], heap[minChildIndex]] = [
        heap[minChildIndex],
        heap[parentIndex],
      ];
      parentIndex = minChildIndex;
    } else {
      return node;
    }
  }
}

function getMinChildIndex(heap, parentIndex) {
  const leftChildIndex = parentIndex * 2;
  const rightChildIndex = leftChildIndex + 1;
  const leftChild = heap[leftChildIndex];
  const rightChild = heap[rightChildIndex];
  if (isNoop(rightChild)) {
    return isNoop(leftChild) ? -1 : leftChildIndex;
  }
  return compare(leftChild, rightChild) > 0 ? rightChildIndex : leftChildIndex;
}

function seek(heap) {
  const first = heap[1];
  return isNoop(first) ? null : first;
}

function isNoop(value) {
  return typeof value === 'undefined';
}

function isEmpty(heap) {
  return heap.length === 1;
}

function compare(node0, node1) {
  return node0.indexSort - node1.indexSort;
}

function _print(heap) {
  console.log(heap.slice(1).map(item => item.data).join(','))
}

const heap = Heap()
_print(heap)

push(heap, 4)
push(heap, 2)
push(heap, 1)
push(heap, 7)
push(heap, 6)
push(heap, 8)
push(heap, 5)
push(heap, 4)
push(heap, 4)

_print(heap)
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))
console.log(pop(heap))

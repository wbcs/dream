# 树的概念

## 一、树的定义
树，是`n(n >= 0)`个结点的有限集合。当`n = 0`时，成为空树；当`n > 0`时，该集合满足如下条件：
1. 有且仅有一个成为`根(root)`的特定结点，该结点无前驱，有零或多个直接后继结点。
2. 除根结点之外的`n - 1`个结点可划分为`m(m >= 0)`个互不相交的有限集，每个集合又是一颗树，成为根的`子树(subtree)`。

## 二、树的术语
+ 结点的度(degree)：结点拥有子树的个数；
+ 树的度：树中所有结点的度的最大值；
+ 叶子结点：度为0的结点；
+ 结点的层次：根为第一层，以此类推；
+ 树的深度：树中所有结点的层次的最大值；
+ 森林：m(m >= 0)课互不相交的树的集合称为森林。

# 二叉树

## 二叉树的定义
**二叉树**是`n(n >= 0)`个结点的有限集合。当`n = 0`时，称为`空二叉树`；当n > 0时，该集合由一个根结点及两颗互不相交的，被分别称为`左子树`和`右子树`的二叉树组成。

二叉树可以理解为满足一下两个条件的树：
1. 每个结点的度不大于２；
2. 结点每棵子树的位置是明确区分左右的，不能随意改变

## 二叉树的性质
> 没时间就不写了

## 创建二叉树
```js
function BTNode (data, left, right) {
  this.data = data;
  this.left = left;
  this.right = right;
}

class BTree {
  constructor(arr) {
    this.root = null;
    arr.forEach(val => this.insert(val));
  }
  insert(data) {
    const tree = this.root;
    const node = new BTNode(data, null, null);
    if (!tree) {
      this.root = node;
      return;
    }
    let current = tree;
    let parent;
    while (true) {
      parent = current;
      if (data > current.data) {
        current = current.right;
        if (!current) {
          parent.right = node;
          break;
        }
      } else {
        current = current.left;
        if (!current) {
          parent.left = node;
          break;
        }
      }
    }
  }
  // arr原本的顺序
  preOrder() {
    const stack = [];
    let node = this.root;
    while (node || stack.length) {
      if (node) {
        console.log(node.data);
        stack.push(node);
        node = node.left;
      } else {
        node = stack.pop();
        node = node.right;
      }
    }
  }
  // arr排序后
  inOrder() {
    const stack = [];
    let node = this.root;
    while (node || stack.length) {
      if (node) {
        stack.push(node);
        node = node.left;
      } else {
        node = stack.pop();
        console.log(node.data);
        node = node.right;
      }
    }
  }
}


```


# 树的数据结构
```JavaScript
tree = {
  data: value,
  lchild: tree_type,
  rchild: tree_type
}

```

# 树的非递归遍历
### 先序遍历
```javascript
function preOrder(root) {
  const stack = [];
  let node = root;

  while(node || stack.length) {
    if(node) {
      console.log(node.data);
      stack.push(node);
      node = node.lchild;
    } else {
      node = stack.pop();
      node = node.rchild;
    }
  }
}

```

### 中序遍历

```javascript
function inOrder(root) {
  const stack = [];
  let node = root;

  whie(node || stack.length) {
    if(node) {
      stack.push(node);
      node = node.lchild;
    } else {
      node = stack.pop();
      console.log(node.data);
      node = node.rchild;
    }
  }
}
```

### 后序遍历
```javascript
function postOrder(root) {
  const stack = [];
  let node = root;

  while(node || stack.length) {
    if(node && node.flag) {
      console.log(node.data);
      node = stack.pop();
    } else if(node) {
      node.flag = node.flag === undefined? false: true;
      stack.push(node);
      node = node.flag? node.rchild: node.lchild;
    } else {
      node = stack.pop();
    }
  }
}

```

另一种方法
```javascript
function postOrder(root) {
  const stack = [];
  let node = root;
  let prev;

  while(node || stack.length) {
    while(node) {
      stack.push(node);
      node = node.lchild;
    }

    if(stack.length) {
      node = stack[stack.length - 1];
      if(!node.rchild || node.rchild === prev) {
        node = stack.pop();
        console.log(node.data);
        prev = node;
        node = null;
      } else {
        node = node.rchild;
      }
    }
  }
}
```

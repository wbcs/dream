# 树的数据结构
```
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
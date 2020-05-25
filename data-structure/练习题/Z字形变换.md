# 描述
示例 1:

输入: s = "LEETCODEISHIRING", numRows = 3
输出: "LCIRETOESIIGEDHN"
```
L   C   I   R
E T O E S I I G
E   D   H   N
```

示例 2:

输入: s = "LEETCODEISHIRING", numRows = 4
输出: "LDREOEIIECIHNTSG"
解释:
```
L     D     R
E   O E   I I
E C   I H   N
T     S     G
```


意思就是说，给一串 string 和一个 number ，按照Z字的形状变换之后，再从左到右、从上到下的顺序打印新的顺序。

> 其实这道题没有想象的难。

# 思路

思路就是把排成Z型后的字符们，放到一个二维数组里，然后我们只需要遍历这个二维数组就能得到结果了。

于是问题就转变成了怎么把字符串排成Z。

首先可以发现，只要笔是往下划的时候， `column` 不变， `row` 一定在+1；只要往上划， `column` 在+1，`row`在-1。


所以只要在遍历字符串的过程中，满足 `row` 在往下的时候不能大于 `numRows - 1`，往下划的时候 `row` 不能小于 0 同时 `column` 要`+1`.

等遍历完，我们的二维数组就有了，结果自然就ok了。

# 代码
好了，这下可以看代码了：
```js
Array.prototype.set = function(i, j, val) {
  if (!Array.isArray(this[i])) {
    this[i] = []
  }
  this[i][j] = val
}

function convert(s, numRows) {
  let i = 0
  let row = 0
  let column = 0
  let isDown = true // 方向，向下为true
  const Z = new Array(numRows)

  while (i < s.length) {
    if (isDown) {
      Z.set(row++, column, s[i++])
      if (row === numRows - 1) {
        isDown = false
      }
    } else {
      Z.set(row--, column++, s[i++])
      if (row === 0) {
        isDown = true
      }
    }
  }

  return Z.map(subArr => subArr.join('')).join('')
}
```

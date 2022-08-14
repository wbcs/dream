# 前言

# 判断文件是否存在

```javascript
fs.exists(filepath, (exists) => {
  if (exists) {
    console.log('文件存在');
  } else {
    console.log('文件不存在');
  }
});
```

它的同步版：

```javascript
const isExists = fs.existsSync(filepath);
```

本人不太用的：

```javascript
fs.access(filepath, (err) => {
  if (err) {
    console.log('不存在');
    return;
  }
  console.log('存在');
});
```

> `fs.access`还可以判断文件的权限。

# 读取  文件

```javascript
fs.readFile(filepath, 'utf8', (err, data) => {
  if (err) {
    //
    return;
  }
  console.log(data);
});
```

同步版本一样后面加个 sync， 就不说了。

比较底层的接口：

```javascript
fs.open(filepath, 'r', (err, fd) => {
  if (err) {
    throw err;
  }
  const buffer = new Buffer(21);
  /**
   * 从buffer[1]开始，从文件读第2byte~20字节
  */
  fs.read(fd, buffer, 1, 20, 2, (err, bytesNum, buffer) => {
    // 这里的buffer和外面的是同一个，
  });
});
const buffer = new Buffer();
/**
 * buffer: 用来存储内容的东东
 * offset：从buffer[offset] 开始放
 * length: 读取字节数
 * position：从文件的哪个位置读
*/
fs.read(fd, buffer, offset, length, position, (err, bytesNum, buffer) => {});

```

通过流来读取：

```javascript
const rs = fs.createReadStream(filepath, 'utf8');
rs
  .on('data', chunk => console.log(chunk))
  .on('error', () => console.log(err));
  .on('end', () => console.log('没有数据了'))
  .on('close', () => console.log('read stream已关闭'));
```

# 写入/创建文件

创建文件就是写入文件。哪怕文件原来存在，在写入的时候也会被覆盖掉。

```javascript
fs.writeFile(filepath, data, 'utf8', (err) => {
  if (err) {
    return console.log('写入失败');
  }
  console.log('写入成功');
});
```

当然这个  也有同步  版本，同上。

通过  流来写入：

```javascript
const ws = fs.createWriteStream(filepath, 'utf8');
ws.on('close', () => console.log('over'));
ws.write(data);
ws.write(data);
ws.write(data);
ws.end(data);
```

和`fs.read`一样的`fs.write`:

```javascript
fs.open(filepath, 'w', (err, fd) => {
  if (err) {
    throw err;
  }
  const buffer = 'some value';
  fs.wirte(fd, buffer, 0, buffer.length, 0, (err, bytesNum, buffer) => {
    //
  });
});
```

#  删除文件

```javascript
fs.unlink(filepath, (err) => {});
```

>  有同步版本

# 删除/创建目录

```javascript
fs.mkdir(path [, mode], err => {}); // callback必须传
fs.rmdir(path, err => {}); // callback必须有
```

> 也有同步版本。

# 重命名

```javascript
fs.rename(oldname, newname, (err) => {});
```

> 有同步

# 监听文件修改

```javascript
fs.watchFile(
  filepath,
  {
    interval: 1000, // 多长时间检查一次
  },
  (now, prev) => {}
);
```

> 原理就是轮询, 可以用`fs.unwatchFile(filepath)`移出。

# 追加内容

```js
const fs = require('fs');

fs.appendFile(file, data [,optinos], cb);
// optinos = {
  encodeing: '',
  mode: '0o666'(默认),
  flag: 'a',
};
```

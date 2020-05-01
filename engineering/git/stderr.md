# git clone stderr
在使用nodejs的exec执行git clone的时候，总是会报错，检查之后发现在stderr
```js
const {exec} = require('child_process');
exec(`git clone ${repository}`, (err, stdout, stderr) => {

})
```
但是下载的结果是完全没有问题的。

查阅资料发现，在git clone的过程中，会将一些详细的状态进度信息写入stderr。

解决办法：
```sh
git clone -q repository
```
-q 的意思就是强制将进度信息不写入stderr中。
# id_rsa重命名后出错解决
公司电脑需要同时支持`gitlab`和`github`，`id_rsa`肯定不能是同一个，所以重命名为`id_rsa_github`。但是这样报错`Permission denied (publickey)`

执行
```
ssh-add ~/.ssh/id_rsa_github
```
# 基本运行过程
`TSL/SSL`协议的基本思路就是采用**公钥加密法**，`client`向`server`所要`public key`，然后用`public key`加密信息。`server`使用`private key`来解谜。

## 如何保证public key不被篡改？
将public key放在证书中。证书公认可信，public key就是可信的。

## 公钥加密计算量太大，如何减少耗用时间？
每次对话，client和server都生成一个”对话秘钥“。“对话秘钥”是对称加密，使用“对话秘钥”来加密内容，运算速度就快了。而这个“对话秘钥”被server的public key加密后给client，这样又解决了“对话秘钥”的加密问题。
1. 客户端向服务器端索要并验证公钥。
2. 双方协商生成"对话密钥"。
3. 双方采用"对话密钥"进行加密通信。

> 上面过程的前两步，又称为"握手阶段"（handshake）。
@TODO
技术相关回头再写吧。

好玩的：

- 解压一个 electron app 源代码：

```
npm install -g asar
npm install -g shuji
cd /Applications/Fuck.app/Contents/Resources/
asar extract app.asar project-code
asar pack project-code app.asar
shuji some-code.js.map -o dirname
```

对 renderer 的代码修改麻烦，但是可以直接改 main 进程，这样就能愉快地打开 devTool 和各种按钮了。

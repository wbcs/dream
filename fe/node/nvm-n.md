# nvm vs n
两者都是 nodejs 的版本管理工具。

区别：
+ 和 node 的关系：
  + n可以通过 `npm install` ,也就是说 `n` 是一个 `npm` 包， `n` 和 `node` 是存在循环依赖关系的；
  + `nvm` 则是一个单独的软件，不依赖 `node`
+ 对全局包的处理方式：
  + n 在切换 `node` 版本的时候对于全局的 `node` 包是直接忽略的；
  + `nvm` 则是将全局的包都保存到各自版本的沙箱中，因此切换 `node version` 时需要重新安装全局包
+ 系统支持： `nvm` 不支持 `Windows`
+ `node` 所处目录不同：
  + `n` 和 `node` 相同，都是出于 `/usr/local/bin` 中，所以在操作非用户目录时需要 `sudo`
  + `nvm` 则是在 `~/.nvm/versions`

# 下载安装
n
```sh
npm install -g n
```
nvm
```sh
# https://github.com/nvm-sh/nvm 最好和README保持一致
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# 或者
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
vi ~/.nvm/.bash_profile
```
键入：
```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

```sh
source ~/.nvm/.bash_profile
```

ok
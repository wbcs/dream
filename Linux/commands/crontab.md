# crontab

linux 任务调度分为两类：

- 系统工作：系统周期性索要执行的工作，如数据备份、cache 的清理等
- 个人工作：某用户需要定时做的工作，由用回自行设置

语法： `crontab [-u user] file` / `crontab [-u user] {-l | -r | -e}`

- -e 使用 editor 来设置时程表
- -r 删除目前的时程表
- -l 列出目前的时程表

时间格式： `f1 ... f5 cmd` 分别代表 min、hour、day、month、week

# 定时脚本

因为环境变量的原因，如果需要定时执行脚本，需要指定脚本的解释器以及脚本的绝对路径。

/Users/wangbing/script.js

```js
# /usr/bin/env node

console.log('this is my first cronjob!')
```

`crontab /Users/wangbing/script.js`

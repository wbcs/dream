# 前言
package.json只要开发就得用到，遗憾的是现在我都没有搞清楚大部分的字段，所以现在开始学习一下。

# 各个字段

## main
`main`指的是加载入口文件，比如：`require('module_name')`，就会加载`main`字段对应的文件。默认为模块根目录下的`index.js`文件

## module
`module`和`main`差不多，都是引入时加载的文件名，和`main`不同的是：`module`是在`import`时加载的文件，而`main`是`require`时加载的文件。也就是说`main`对应`CMD`,而`module`对应`ES6`。

## scripts
`scripts`指定了运行脚`shell`命令的`npm`命令行缩写，比如：`start`指定了运行`npm run start`时，所要执行的命令。

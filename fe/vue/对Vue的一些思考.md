# 为什么 Vue 推崇把 js、html、css 都写在一个文件里，而且直接在 DOM 上帮事件？

首先明白一件事情：为什么之前要分开？

因为之前如果把这些都写在一个 html 中，文件太过臃肿，可读性、可维护性都很差。但是现在的项目更大了，如果依然把一个项目分成 html、css、js，那每个文件单独也会很大。而现在主流框架采取组件化开发，将原先以页面为单位的 web，分成一个个 component。每个 component 的结构(html)、样式、逻辑和数据都放在一起，不会很大，而且 html 对应的各个样式也能够很清晰的维护、可读。

至于直接使用指令，而不用 addEventListener 去给 DOM 添加事件，是因为给 DOM 写内敛函数不背推崇的原因就是找不到这个函数在哪，以及只能绑定一个等等。但是 Vue 底层也会使用标准 DOM 方法去给其绑定事件。本质上不存在被替换的可能。其次 js 和 HTML(template)在一起，也能搞很快发现对应的 cb 在哪 方便维护。

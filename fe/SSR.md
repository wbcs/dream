# performance

在加载基于 virtual dom 的 UI 框架开发的 web APP 时，必须要经历的流程：

1. 获取 app 的入口 html
2. 下载 html 中的 js 资源，并解析、执行
3. 得到最终的 DOM，得到可交互页面

在此之前，页面都是白屏。而 SSR 可以直接返回生成好的 HTML，不需要等待 js 被加载、解析、执行即可展示完整的 UI

下面例举一些 SSR 特有的优势&性能优化的点。

## reduce bundle size

- 将一些逻辑放在 server 执行，只返回结果给 client，可以避免一些第三方依赖被打入到 client bundle 之中，减小资源大小
- 避免 node polyfill

比如我想让我的页面展示当前日期：

```tsx
function Index() {
  return <time>{new Date().toString()}</time>;
}

export default Index;
```

有点丑，我想用 `dayjs` format 成 `YYYY-MM-DD`

```tsx
import dayjs from 'dayjs';

function Index() {
  return <time>{dayjs().format('YYYY-MM-DD')}</time>;
}

export default Index;
```

| CSR                                                                                                             | SSR                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![image](https://user-images.githubusercontent.com/33517328/194039431-64b5de2f-ad87-43e7-a1eb-53c5cc43932b.png) | ![image](https://user-images.githubusercontent.com/33517328/194039664-ee85fada-9cdc-4554-a469-84edd936e5c9.png) |
| CSR bundle size: 200K                                                                                           | SSR bundle size: 196K                                                                                           |

![image](https://user-images.githubusercontent.com/33517328/194035335-f35a51dc-3d33-46b4-a855-d9f31765510a.png)

> 我只是单纯的 format 一下就要花 7kb...

可以看到 `dayjs` 的体积没有被包含在 client bundle (public/build) 之中。

同样的，想在 client 中使用一些 `nodejs` 系统模块，也不再需要 `polyfill`, 只需要将其扔到 server 执行即可。

## http -> rpc

不同于浏览器加载资源只能使用有限的网络协议(通常是 http)，在 server 端我们获取资源能力有了显著的提升，我们使用资源的成本更低。


| CSR                                                                                             | SSR                                                                                             |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| ![image](https://code.byted.org/dp/feedback/uploads/dc74f36271d87ad1ebdf6324f7075ae2/image.png) | ![image](https://code.byted.org/dp/feedback/uploads/c1855d857260713a1557377f0a292e4a/image.png) |
| CSR bundle size: 200K                                                                           | SSR bundle size: 196K                                                                           |

# Remix 实践

- SSR

## Why SSR

- 性能
- 安全
- 职责 & 效率
- 问题
- future
- 总结

# 性能

目前影响 Web App 性能的三大瓶颈：

1. 网络
2. 复杂页面浏览器的 layout、repaint
3. 基于 virtual dom 的 UI 框架 diff

> 第三点我们基本无能为力，第二点 CSR 和 SSR 都可以着手优化，所以主要提升在**网络**

- SEO：对于中台项目基本不会考虑 SEO（也有一些对内部搜索引擎有 SEO 的需求）
- 首屏：需要等待 js 文件的下载、解析、执行后才能生产对应的页面，在此之前页面是空白
- disabled javascript: 禁止 js 的浏览器，应用会失效

## 网络

**如何提升网络的加载性能？**

- cache
- 提高资源获取效率

### cache

避免重复加载已经加载过的资源

- HTTP Cache
- `prefetch` / `preload`
- `react-query` / `swr` / 前端存储(storage)
- 前端存储
- SSG

### 提高资源获取效率

不同于 client，我们对 server 有绝对的控制权，其 CPU、Memory、GPU、网络环境都高度可控。于此同时，server 发起网络请求的成本要比 client 小得多

> no throttling > fast 3G > slow 3G > offline

- server 网络请求时延相较于 client 要小很多，可以把很多请求资源的操作都放到 server 执行
- 可以自由选择、更换网络协议，可以把一些 http 切换成效率更高的 rpc

## data fetching

复杂页面浏览器的 layout、repaint，这些无论是 SSR 还是 CSR 都能够着手优化，所以这里谈谈另一个问题——首屏。

- 首屏
  - data fetching
    - waterfall
    - suspense
  - streaming render
- react18: https://github.com/reactwg/react-18/discussions/37

# 安全

cookie http only
跨域 same-site

# 职责 & 效率

## 职责

得益于 nodejs 的发展，前端得以从浏览器跳脱出来，前端技术也不再仅仅只是写写 UI；

“后端更懂业务”、“前端同学提不出来有加载的意见”等声音会时不时听到。

后端之所以对业务更了解，不是他们的智商更高，也不是他们的工种更有技术含量，而是很多业务逻辑如果他们不了解是没有办法开发、交付的。这种耳濡目染的优势，相较于前端不了解业务逻辑都可以完成本质工作，完全就是降维打击。

> 所以很多时候应该稍微激进一些，而不是墨守成规。学习了解和每天的落地实践完全是两回事。

- SSR 能够让我们轻松、简单的获取后端资源，使得很多开发工作变得非常容易

```js

```

## 效率

同样的，SSR 能够让我们从 browser only 进化到 server + browser。一些只是简单的 CURD 的后端需求，完全可以通过前端技术栈搞定，告别以下 case:

<img src="https://user-images.githubusercontent.com/33517328/194047388-4cfd18b3-44db-439f-9879-fd65958f3f56.png" height="250" />
<img src="https://user-images.githubusercontent.com/33517328/194047678-73e80f36-5d0a-4339-90be-66e12cb1d0e2.jpg" height="250" />

一些日常小需求开发联调、前后端进度不一致、上下文切换等开销减少了不止一点点，开发效率提高了不止一点点

> 理论上 SSR 可以让我们完成后端可以完成的一切工作（考虑到专业性，个人还是不建议）

- BFF 层的一些代码可以和 client 代码公用：当然可以抽离一个第三方包出来，结合 monorepo 也可以达到相同的目的。只是 SSR 能够让我们连抽离 shared package 都不需要

# 问题

成本(开发人员的要求)更高：

- 必须很清楚的知道自己的代码是运行在何处。这往往会造成困惑
- 不能对 DOM、BOM 等 browser API 滥用
- 需要学习新的知识：DB、SQL、Middle 以及基本的 devops
- 出现问题后造成的影响会更大

# future

- `remix` / `react-router6`
- react server component

# 总结

- 性能：

  - 更小的 bundle size
  - 更快的渲染速度

- 职责&效率：
  - 轻易获取服务端资源
  - server 和 client 共享代码变得更简单
  - 扩展前端技术栈对业务的掌控范围

SSR 同样也不是银弹，想接入某个框架或者使用某个范式就想解决所有问题是不可能的。

# 前言

本文只说明 SSR 和正常的单页面的差别，以及对应的 webpack。

# 和 SPA 的不同

SPA 的 store、router、app 都是只有一份，而 SSR 为防止多个请求之间相互影响，这些都是由原先的一份写成一个工厂函数：

router.js

```js
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export function createRouter() {
  const router = new Router({
    mode: 'hash',
    routes: [{ path: '/', component: () => import('@/component/Home.vue') }],
  });

  return router;
}
```

store.js

```js
import Vue from 'vue';
import Vuex from 'vuex';
import { fetchData } from '@/apis';

Vue.use(Vuex);

export function createStore() {
  const store = new Vuex.Store({
    state: {
      data: '',
    },
    actions: {
      fetchData(context, params) {
        fetchData(params).then((res) => {
          context.commit('setData', res.data);
        });
      },
    },
    mutations: {
      setData(state, data) {
        state.data = data;
      },
    },
  });

  return store;
}
```

main.js

```js
import Vue from 'vue';
import App from './App.vue';
import { createStore } from '@/store';
import { createRouter } from '@/router';

export function createApp() {
  const router = createRouter();
  const store = createStore();

  const app = new Vue({
    store,
    router,
    render: h => h(App);
  });

  return { app, router, store };
}
```

> ok，说完跟 SPA 的原来文件的不同，接下来就得看看入口文件的不同了。

# 两个入口文件

一个是`entry-client.js`,另一个是：`entry-server.js`。

先说 entry-client.js，这个文件跟 SPA 里的 main 比较像，就是挂载实例到 root DOM 中。

`entry-client.js`

```js
import { createApp } from './main.js';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INTIAL_STATE__);
}

router.onReady(() => {
  app.$mount('#app');
});
```

好，接下是主要的部分，如何在服务器端渲染的逻辑，都在这个`entry-server.js`的文件中了。在说它之前，忘了提一点，我们的 vue 文件基本和 SPA 一样，不过需要把请求数据的地方写到我也不知道该咋说的地方。
some.vue

```html
<script>
  export default {
    asyncData(context) {
      // context一般包含store和route信息
      // 在这里请求数据，不过是由server来调用
    },
  };
</script>
```

entry-server.js

```js
import { createApp } from './main';

export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    // 这里的context是在server.js(下面会讲到)传入的
    router.push(context.url);

    router.beforeResolve((to, from, next) => {
      const metched = to.getMetchedComponents();
      const prevMetched = from.getMetchedComponents();

      // 这一步是筛选一下不需要再次请求数据的组件
      let diff = false;
      const activated = metched.filter((c, i) => {
        return diff || (diff = prevMetched[i] !== c);
      });

      Promise.all(
        activated.map((c) => {
          if (c.syncData) {
            // 我们上面写的，在这被调用
            c.syncData({
              router,
              route: to,
            });
          }
        })
      )
        .then(() => {
          next();
          resolve(app);
        })
        .catch((err) => {
          reject(err);
        });

      app.$mount('#app');
    });
  });
};
```

> 现在，入口文件和 vue 相关的文件内容都已经准备 ok 了。关于代码最后一步就是写 node server.js, 不过接下来不说这个，留到最后，我们现在还需要干一件事，就是配置 webpack，因为需要在 node 运行 vue 和 es2015+。

# webpack

## webpack.base.js

它的作用就是解析 vue、js 文件，转译为 ES5。具体步骤详见我的文章。这里就不细说了，直接上一个能写 vue 的简单文件：

```js
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      { test: /\.(vue)$/, use: 'vue-loader' },
      { test: /\.js$/, use: 'babel-loader' },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.template.html'),
    }),
    new VueLoaderPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

module.exports = config;
```

## webpack.client.js

这个文件就需要多一个插件，跟一个入口配置：

```js
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const config = merge(baseConfig, {
  entry: './src/entry-client.js',
  plugins: [new VueSSRClientPlugin()],
});

module.exports = config;
```

## webpack.server.js

这个我是直接考的文档的，具体内容是啥意思回头再说吧：

```js
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

module.exports = merge(baseConfig, {
  entry: './src/entry-server.js',
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
  },
  externals: nodeExternals({
    whitelist: /\.css$/,
  }),
  plugins: [new VueSSRServerPlugin()],
});
```

> ok，webpack 配置的最后一步，就是打包咯。

最后分别运行

```shell
  webpack --config webpack.client.js
  webpack --config webpack.server.js
```

完了以后会发现 dist 目录下是这样的：

![](https://user-gold-cdn.xitu.io/2019/2/19/16905e2f35cb0882?w=358&h=366&f=png&s=24724)

这就说明配置成功了。

# 最后的 server.js

server.js

```js
const bundle = require('./dist/vue-ssr-server-bundle.json');
const { createBundleRenderer } = require('vue-server-renderer');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');

const renderer = createBundleRenderer(bundle, {
  clientManifest,
});

const server = require('express')();

server.get('*', (req, res) => {
  renderer
    .renderToString({
      url: req.url,
    })
    .then((html) => {
      res.send(html);
    })
    .catch((err) => {
      res.status(err.status || 500).send('something is error...');
    });
});

server.listen(8080);
```

最后，node server.js。

![](https://user-gold-cdn.xitu.io/2019/2/19/16905e4b0efbe7a3?w=1175&h=458&f=png&s=45892)

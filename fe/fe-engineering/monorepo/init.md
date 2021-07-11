# why?

- 构建优势：
  - 多个项目的公共依赖可以被复用，开发下载总时长、总大小减小
  - 配置可以复用，添加子项目的成本很低
  - 子项目之间依赖方便管理，无需 publish。本地 link 便捷

# 搭建一个 workspace

```sh
# install yarn && init plugin/configs
➜ npm install yarn -g
➜ yarn set version berry
➜ yarn plugin import workspace-tools

# override yarn2 pnp
➜ echo 'nodeLinker: node-modules' > .yarnrc.yml
➜ touch yarn.lock
➜ yarn

# create a workspace
➜ yarn add lerna -D
➜ lerna init
➜ lerna create shared
➜ yarn workspace shared add react -D
➜ yarn workspace shared remove react -D
# yarn workspaces foreach <command>
➜ yarn add eslint perttier lint-staged husky -D
➜ npx husky install
➜ npx husky add .husky/pre-commit "npm run prepare"

➜ git add .
➜ git commit -m "chore: project init"

# next time
ƒ➜ yarn workspaces foreach install
➜ yarn workspaces foreach cache clean
```

package.json:

```json
{
  "name": "learn-monorepoo",
  "private": true,
  "workspaces": ["packages/*"],
  "devDependencies": {
    "eslint": "^7.23.0",
    "husky": "^6.0.0",
    "lerna": "^4.0.0",
    "lint-staged": "^10.5.4",
    "prettier": "^2.2.1"
  },
  "lint-staged": {
    "**/*.{js,json,ts,css,less,md,jsx,tsx}": ["prettier --write"]
  },
  "scripts": {
    "prepare": "lint-staged"
  }
}
```

lerna.json:

```json
{
  "packages": ["packages/*"],
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true
}
```

# tip

lerna 有两种管理模式：

- `fixed(default)`: 所有包共用 `lerna.json` 里的 `version` `。publish` 时，被修改的（未修改的则不会）会自动更新 `package.json` 的 `version` 为 `ƒ` 里的 `version`。并且当 `lerna.json` 里的 `version` 的主版本被修改时，所有的包（包括未被修改的）都会更新并发布。
- `independent`: 允许每个包自行更新版本号，`lerna publish` 时需要逐个选择被修改的包的版本。

> 如果 yarn 报错的话 `touch yarn.lock && yarn`; yarn node 使 node 采用 pnp 或 `node --require="./.pnp.js" index.js`

> 因为 `lerna` 和 `yarn2` 在一起使用时, `lerna boostrap` 会报错，所以用 `yarn workspaces foreach install` 代替。同样的 `lerna clean` 只会清除 `node_modules`, 而 `yarn2` 抛弃了 `node_modules`, 采用 `yarn workspaces foreach cache clean` 代替。

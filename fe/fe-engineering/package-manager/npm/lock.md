# package-lock.json vs npm-shrinkwrap.json

两者内容完全相同，可以通过 `npm shrinkwrap` 将一个 `package-lock.json` revert 到 `npm-shrinkwrap.json`

- npm 版本区别：
  - `package-lock.json` 是 `npm5` 才有的
  - `npm-shrinkwrap.json` 则在 `npm2` 就有了
- npm publish 行为区别：
  - `package-lock.json` 不会被 publish
  - `npm-shrinkwrap.json` 会
    > 所以，如果你想要使用你包的所有用户都拥有相同的依赖，可以考虑使用后者。

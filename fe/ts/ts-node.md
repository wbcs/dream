## 踩坑

### ts 的 esm 还处于 experimental 阶段，使用 `ts-node` 直接运行一个 esm 的话会报错 `Unknown file extension ".ts"`

package.json

```json
{
  "type": "module"
}
```

tsconfig.json

```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext"
  }
}
```

如果干掉 `"type": "module"` 又会报错 `SyntaxError: Cannot use import statement outside a module`.

解决办法在 tsconfig.json 里加一行

```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext"
  },
  "ts-node": {
    "esm": true
  }
}
```

> https://github.com/TypeStrong/ts-node/issues/1007

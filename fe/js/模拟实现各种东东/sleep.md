什么while循环，用时间戳实现的那种垃圾东西就不写了。没意思。

```js
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

!(async function() {
  for (let i = 0; i < 5; i++) {
    if (i === 3) {
      await sleep(3000);
      console.log('weak up!');
    } else {
      console.log(i);
    }
  }
})();
```

> okay!
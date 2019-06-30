```js
function querystring(str) {
  const res = Object.create(null);
  const start = str.indexOf('?') + 1;
  if (!start) return res;
  let end = str.indexOf('#');
  if (end === -1) {
    end = str.length;
  }
  const substr = str.slice(start, end);
  return substr
    .split('&')
    .map(keyVal => keyVal.split('=').map(decodeURIComponent))
    .reduce((prev, [key, val]) => {
      if (key === '') return res;
      if (key in prev) {
        const arrOrVal = prev[key];
        prev[key] = Array.isArray(arrOrVal) ?
          [...arrOrVal, val] :
          [arrOrVal, val];
      } else {
        prev[key] = val;
      }
      return prev;
    }, res);
}
```
```js
function Promise(cb) {
  this.PromiseStatus = 'pending';
  const resolve = (val) => {
    if (this.PromiseStatus !== 'pending') {
      return;
    }
    this.PromiseStatus = 'fullfilled';
    this.PromiseValue = val;
    if (this._resolveCallback) {
      setTimeout(() => {
        const ret = this._resolveCallback(val);
        const {resolveCb, rejectCb} = this._resolveCallback;
        if (ret instanceof Promise) {
          ret.then(resolveCb, rejectCb);
        } else {
          resolveCb(ret);
        }
      });
    }
  };
  const reject = (val) => {
    if (this.PromiseStatus !== 'pending') {
      return;
    }
    this.PromiseStatus = 'rejected';
    this.PromiseValue = val;
    if (this._rejectCallback) {
      setTimeout(() => {
        const ret = this._rejectCallback(val);
        const {resolveCb, rejectCb} = this._rejectCallback;
        if (ret instanceof Promise) {
          ret.then(resolveCb, rejectCb);
        } else {
          resolveCb(ret);
        }
      });
    }
  };
  cb(resolve, reject);
}

Promise.resolve = function(val) {
  return new Promise(resolve => resolve(val));
};

Promise.reject = function(val) {
  return new Promise((resolve, reject) => reject(val));
};

Promise.prototype.then = function(resolve, reject) {
  return new Promise((resolveCb, rejectCb) => {
    if (this.PromiseStatus === 'fullfilled') {
      setTimeout(() => {
        const ret = resolve(this.PromiseValue);
        if (ret instanceof Promise) {
          ret.then(resolveCb, rejectCb);
        } else {
          resolveCb(ret);
        }
      });
    } else if (this.PromiseStatus === 'rejected') {
      setTimeout(() => {
        const ret = reject(this.PromiseValue);
        if (ret instanceof Promise) {
          ret.then(resolveCb, rejectCb);
        } else {
          resolveCb(ret);
        }
      });
    } else {
      this._resolveCallback = resolve;
      resolve.resolveCb = resolveCb;
      resolve.rejectCb = rejectCb;
      if (!reject) return;
      this._rejectCallback = reject;
      resolve.rejectCb = rejectCb;
      resolve.rejectCb = rejectCb;
    }
  });
};

Promise.prototype.catch = function(reject) {
  if (this.PromiseStatus === 'rejected') {
    setTimeout(() => {
      reject(this.PromiseValue);
    });
  }
};

// const promise = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     if (Math.random() * 10 > 5) {
//       resolve(123);
//     } else {
//       reject(456);
//     }
//   });
//   console.log('start');
// });

// console.log('sync')

// promise.then(res => {
//   console.log(res)
// }, (err) => {
//   console.log('err', err);
// })

Promise.resolve('resolve')
  .then(res => {
    console.log(res);
    return 0;
  }).then(res => {
    console.log(res)
    return 1;
  }).then(res => {
    console.log(res)
  }).then(res => {
    console.log(res)
  }).then(res => {
    console.log(res)
  })
```

还没写完，，有问题
# EventEmitter

```js
class EventEmitter {
  constructor() {
    this._events = {};
  }
  on(eventName, cb) {
    if (!this._events[eventName]) {
      this._events[eventName] = [cb];
    } else {
      this._events[eventName].push(cb);
    }
  }
  onece(eventName, cb) {
    cb.onece = true;
    this.on(eventName, cb);
  }
  emit(eventName, ...args) {
    const queue = this._events[eventName];
    if (!queue) return;
    queue.forEach((cb) => {
      try {
        cb(...args);
      } catch (e) {
        console.error(e);
      } finally {
        if (cb.onece) {
          // 放到整个queue执行完之后再干
          Promise.resolve().then(() => {
            this.off(eventName, cb);
          });
        }
      }
    });
  }
  off(eventName, cb) {
    const queue = this._events[eventName];
    if (!queue) return;
    queue.splice(queue.indexOf(cb), 1);
  }
}
```

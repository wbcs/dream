# 深克隆
```javascript
const deepClone = function(obj) {
  if(typeof obj !== 'object' || obj === null) {
    /**
     * 如果是自定義函數，則拷貝
     * 否則直接返迴
     */
    if(typeof obj === 'function') {
      let fn;
      let fnStr = obj.toString();

      if(fnStr !== `function ${obj.name}() { [native code] }`) {
        eval(`fn = ${fnStr}`);
        return fn;
      }
    }

    return obj;
  }

  // 如果在weakMap中存在obj的key，说明此对象已经被复制过，直接返回对应复制过的对象
  if(deepClone.weakMap.has(obj)) {
    return deepClone.weakMap.get(obj);
  }

  let newObj = Object.create(obj.constructor.prototype);

  // 构造函数如果是types的元素，则直接创建
  let types = [Number, String, Boolean, RegExp, Date, Set, Map];
  if( types.includes(obj.constructor) ) {
    newObj = new obj.constructor(obj)

  }

  // 将新创建的对象作为value，原对象作为key防止环的问题
  deepClone.weakMap.set(obj, newObj);

  if( newObj.constructor === Set ) {
    obj.forEach( value => newObj.add(deepClone(value)) );

  } else if( newObj.constructor === Map ) {
    // 如果对应的key是对象，也要考虑复制的话，可以对key也使用deepClone()
    obj.forEach( (value, key) => newObj.set(key, deepClone(value)) );

  } else if( newObj.constructor === Array ) {
    obj.forEach((item, index) => newObj[index] = deepClone(item));
    
  } else {
    Object.keys(obj).forEach( item => newObj[item] = deepClone(obj[item]) );
  }

  return newObj;
};

deepClone.weakMap = new WeakMap();
```
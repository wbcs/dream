# 单例模式 singleton mode

简单来说就是一个 class 只能构建一个实例的设计模式。

# 传统单例模式

```ts
class Singleton {
  private static instance = null;
  static getInstance(...args) {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = new Singleton(...args);
    return Singleton.instance;
  }
  constructor(...args) {
    //
  }
}

const ins0 = Singleton.getInstance();
const ins1 = Singleton.getInstance();
console.log(ins0 === ins1); // true
```

# 透明单例模式

顾名思义，就是当做正常的 class 来使用，不过这样 class 就不能 new 出多个实例了，扩展性不好。

```ts
class Singleton {
  private static instance = null;
  constructor(...args) {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    // some action
    Singleton.instance = this;
  }
}

const ins0 = new Singleton();
const ins1 = new Singleton();
console.log(ins0 === ins1); // true
```

# 代理单例模式

创建一个新的 class，getInstance 等操作交给这个代理人去做，既不会影响原有 class，又能够透明使用新的 class。

```ts
class Real {}
const createSingleton = (RealClass) => {
  return class ProxyClass {
    private static instance = null;
    constructor(...args) {
      if (!ProxyClass.instance) {
        ProxyClass.instance = new RealClass();
      }
      return ProxyClass.instance;
    }
  };
};
const Singleton = createSingleton(Real);

const ins0 = new Singleton();
const ins1 = new Singleton();
console.log(ins0 === ins1); // true
```

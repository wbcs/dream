/**
 * 这个应该就是mobx是核心
 */

class Atom {
  constructor(name) {
    if (name === void 0) {
      name = 'Atom@' + getNextId();
    }
    this.name = name;
    this.isPendingUnobservation = false; // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed
    this.isBeingObserved = false;
    this.observers = new Set();
    this.diffValue = 0;
    this.lastAccessedBy = 0;
    this.lowestObserverState = IDerivationState.NOT_TRACKING;
  }
}

class ObservableObjectAdministration {
  constructor(target, values, name, defaultEnhancer) {
    if (values === void 0) {
      values = new Map();
    }
    this.target = target;
    this.values = values;
    this.name = name;
    this.defaultEnhancer = defaultEnhancer;
    this.keysAtom = new Atom(name + '.keys');
  }
}

export default ObservableObjectAdministration;

interface Action<T> {
  payload?: T
  type: string
}

interface Module {
  count: number;
  message: string;
  asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>;
  syncMethod<T, U>(action: Action<T>): Action<U>;
}

type Result = {
  asyncMethod<T, U>(input: T): Action<U>;
  syncMethod<T, U>(action: T): Action<U>;
}

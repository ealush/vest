import isFunction from './isFunction';
import { noop } from './noop';

// Type declaration for Promise.withResolvers (ES2024 feature)
declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    };
  }
}

export function withResolvers<T>() {
  if (isFunction(Promise.withResolvers)) {
    return Promise.withResolvers<T>();
  }

  let resolve: (value: T | PromiseLike<T>) => void = noop,
    reject: (reason?: any) => void = noop;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

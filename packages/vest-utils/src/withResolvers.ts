import { noop } from 'noop';

export function withResolvers<T>() {
  if (Promise.hasOwnProperty('withResolvers')) {
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

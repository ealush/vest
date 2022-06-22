import isFunction from 'isFunction';

export default function isPromise(value: any): value is Promise<unknown> {
  return value && isFunction(value.then);
}

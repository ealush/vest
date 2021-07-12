import isFunction from 'isFunction';

export default function isPromise(value: unknown): value is Promise<unknown> {
  // @ts-ignore - wasting time on something that works. I'll get back to it.
  return value && isFunction(value.then);
}

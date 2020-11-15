import isFunction from 'isFunction';

export default function isPromise(value) {
  return value && isFunction(value.then);
}

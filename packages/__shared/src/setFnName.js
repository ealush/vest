export default function setFnName(fn, value) {
  // Pre ES2015 non standard implementation, "Function.name" is non configurable field
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
  return Object.getOwnPropertyDescriptor(fn, 'name')?.configurable
    ? Object.defineProperty(fn, 'name', { value })
    : fn;
}

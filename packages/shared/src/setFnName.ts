export default function setFnName<T extends Function>(fn: T, value: string): T {
  return Object.defineProperty(fn, 'name', { value });
}

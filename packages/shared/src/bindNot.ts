export default function bindNot<T extends (...args: any[]) => unknown>(fn: T) {
  return (...args: Parameters<T>): boolean => !fn(...args);
}

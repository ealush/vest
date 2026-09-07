export function invokeWithUnknown<Result>(
  fn: (...args: never[]) => Result,
  ...args: unknown[]
): Result {
  return fn(...(args as never[]));
}

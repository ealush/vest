export function callRuleWithValue<Result>(
  rule: (value: never) => Result,
  value: unknown,
): Result {
  return rule(value as never);
}

export function runRuleWithValue<Result>(
  rule: { run(value: never): Result },
  value: unknown,
): Result {
  return rule.run(value as never);
}

export function testRuleWithValue<Result>(
  rule: { test(value: never): Result },
  value: unknown,
): Result {
  return rule.test(value as never);
}

export function invokeWithUnknown<Result>(
  fn: (...args: never[]) => Result,
  ...args: unknown[]
): Result {
  return fn(...(args as never[]));
}

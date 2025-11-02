export function BuildRule<
  R extends RuleInstance<T, Args>,
  T,
  Args extends any[],
>(rule: (...args: Args) => RuleRunReturn<T>): R {
  return {
    run: (...args: Args) => rule(...args),
    infer: {} as T,
  } as R;
}

export function ruleRunReturn<T>(
  pass: boolean,
  type: T,
  message?: string,
): RuleRunReturn<T> {
  const out: RuleRunReturn<T> = {
    pass,
    type,
  };

  if (message) {
    out.message = message;
  }

  return out;
}

export interface RuleRunReturn<T> {
  pass: boolean;
  type: T;
  message?: string;
}

export interface RuleInstance<T, Args extends any[] = any[]> {
  run: (...args: Args) => RuleRunReturn<T>;
  infer: T;
}

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

export function ruleRunReturn<T>(passes: boolean, type: T): RuleRunReturn<T> {
  return {
    passes,
    type,
  };
}

export interface RuleRunReturn<T> {
  passes: boolean;
  type: T;
}

export interface RuleInstance<T, Args extends any[] = any[]> {
  run: (...args: Args) => RuleRunReturn<T>;
  infer: T;
}

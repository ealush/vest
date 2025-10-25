export function BuildRule<T, Args extends any[]>(
  rule: (...args: Args) => RuleRunReturn<T>,
): RuleInstance<T, Args> {
  return {
    run: (...args: Args) => rule(...args),
    infer: {} as T,
  };
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

export type RuleInstance<T, Args extends any[] = any[]> = {
  run: (...args: Args) => RuleRunReturn<T>;
  infer: T;
};

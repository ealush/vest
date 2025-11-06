import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function noneOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        if (rule.run(value).pass) {
          return Failing(value);
        }
      }
      return Passing(value);
    },
    infer: {} as T,
  };
}

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function allOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        const result = rule.run(value);
        if (!result.pass) {
          return Failing(value);
        }
      }
      return Passing(value);
    },
    infer: {} as T,
  };
}

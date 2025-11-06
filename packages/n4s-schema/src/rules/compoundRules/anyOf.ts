import { MultiTypeInput } from './types';

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function anyOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]> {
  return {
    run: (value: MultiTypeInput<T>) => {
      for (const rule of rules) {
        if (rule.run(value as any).pass) {
          return Passing(value);
        }
      }
      return Failing(value);
    },
    infer: {} as MultiTypeInput<T>,
  };
}

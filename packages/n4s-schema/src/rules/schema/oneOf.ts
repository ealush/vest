import { MultiTypeInput } from './types';

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function oneOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>> {
  return {
    run: (value: MultiTypeInput<T>) => {
      let passingCount = 0;
      for (const rule of rules as RuleInstance<any, any>[]) {
        if (rule.run(value as any).pass) {
          passingCount++;
          if (passingCount > 1) {
            return Failing(value as any);
          }
        }
      }
      return passingCount === 1 ? Passing(value as any) : Failing(value as any);
    },
    infer: {} as MultiTypeInput<T>,
  };
}

import { MultiTypeInput } from './types';

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function isArrayOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>[], [MultiTypeInput<T>[]]> {
  return {
    run: (value: MultiTypeInput<T>[]) => {
      if (!Array.isArray(value)) {
        return Failing(value);
      }

      const pass = value.every(item =>
        (rules as RuleInstance<any, any>[]).some(
          rule => rule.run(item as any).pass,
        ),
      );

      return pass ? Passing(value) : Failing(value);
    },
    infer: [] as MultiTypeInput<T>[],
  };
}

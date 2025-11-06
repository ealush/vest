import { ctx } from 'enforceContext';
import { mapFirst } from 'vest-utils';

import { MultiTypeInput } from './types';

import { BuildRule, Failing, Passing, RuleInstance } from 'enforceUtil';

export function isArrayOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>[], [MultiTypeInput<T>[]]> {
  return BuildRule<
    RuleInstance<MultiTypeInput<T>[], [MultiTypeInput<T>[]]>,
    MultiTypeInput<T>[],
    [MultiTypeInput<T>[]]
  >((value: MultiTypeInput<T>[]) => {
    if (!Array.isArray(value)) {
      return Failing(value);
    }

    return (
      mapFirst(value, (item, breakout, index) => {
        const res = ctx.run({ value: item, set: true, meta: { index } }, () => {
          // Try each rule with the item - any rule passing is OK
          const anyPass = (rules as RuleInstance<any, any>[]).some(
            rule => rule.run(item).pass,
          );
          return anyPass ? Passing(item) : Failing(item);
        });
        breakout(!res.pass, res);
      }) || Passing(value)
    );
  });
}

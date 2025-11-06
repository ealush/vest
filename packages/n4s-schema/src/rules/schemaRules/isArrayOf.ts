import { ctx } from 'enforceContext';
import { mapFirst } from 'vest-utils';

import { RuleRunReturn } from 'RuleRunReturn';

// eslint-disable-next-line max-nested-callbacks
export function isArrayOf<T>(value: T[], ...rules: any[]): RuleRunReturn<T[]> {
  if (!Array.isArray(value)) {
    return RuleRunReturn.Failing(value);
  }

  return (
    mapFirst(value, (item, breakout, index) => {
      const res = ctx.run({ value: item, set: true, meta: { index } }, () => {
        // Try each rule with the item - any rule passing is OK
        const anyPass = rules.some(rule => rule.run(item).pass);
        return anyPass
          ? RuleRunReturn.Passing(item)
          : RuleRunReturn.Failing(item);
      });
      breakout(!res.pass, res);
    }) || RuleRunReturn.Passing(value)
  );
}

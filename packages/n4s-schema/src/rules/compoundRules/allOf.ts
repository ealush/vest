import { mapFirst } from 'vest-utils';

import { BuildRule, Passing, RuleInstance } from 'enforceUtil';

export function allOf<T>(
  ...rules: RuleInstance<T, any>[]
): RuleInstance<T, [T]> {
  return BuildRule<RuleInstance<T, [T]>, T, [T]>((value: T) => {
    return (
      mapFirst(rules, (rule, breakout) => {
        const res = rule.run(value);
        breakout(!res.pass, res);
      }) || Passing(value)
    );
  });
}

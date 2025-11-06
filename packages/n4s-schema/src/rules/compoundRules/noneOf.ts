import { mapFirst } from 'vest-utils';

import { BuildRule, Failing, Passing, RuleInstance } from 'enforceUtil';

export function noneOf<T>(
  ...rules: RuleInstance<T, any>[]
): RuleInstance<T, [T]> {
  return BuildRule<RuleInstance<T, [T]>, T, [T]>((value: T) => {
    return (
      mapFirst(rules, (rule, breakout) => {
        const res = rule.run(value);
        breakout(res.pass, Failing(value));
      }) || Passing(value)
    );
  });
}

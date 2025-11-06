import { mapFirst } from 'vest-utils';

import { RuleRunReturn } from 'RuleRunReturn';

export function noneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, RuleRunReturn.Failing(value));
    }) || RuleRunReturn.Passing(value)
  );
}

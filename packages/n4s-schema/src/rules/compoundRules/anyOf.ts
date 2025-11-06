import { mapFirst } from 'vest-utils';

import { RuleRunReturn } from 'RuleRunReturn';

export function anyOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, res);
    }) || RuleRunReturn.Failing(value)
  );
}

import { mapFirst } from 'vest-utils';

import { Failing, RuleRunReturn } from 'enforceUtil';

export function anyOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, res);
    }) || Failing(value)
  );
}

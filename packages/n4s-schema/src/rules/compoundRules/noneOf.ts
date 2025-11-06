import { mapFirst } from 'vest-utils';

import { Failing, Passing, RuleRunReturn } from 'enforceUtil';

export function noneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, Failing(value));
    }) || Passing(value)
  );
}

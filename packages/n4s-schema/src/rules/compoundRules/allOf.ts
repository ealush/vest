import { mapFirst } from 'vest-utils';

import { Passing, RuleRunReturn } from 'enforceUtil';

export function allOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(!res.pass, res);
    }) || Passing(value)
  );
}

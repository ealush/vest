import { mapFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function noneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, RuleRunReturn.Failing(value));
    }) || RuleRunReturn.Passing(value)
  );
}

// Type for noneOf rule instance
export type NoneOfRuleInstance<T> = RuleInstance<T, [T]>;

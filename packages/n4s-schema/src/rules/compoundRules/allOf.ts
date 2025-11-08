import { mapFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function allOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(!res.pass, res);
    }) || RuleRunReturn.Passing(value)
  );
}

// Type for allOf rule instance
export type AllOfRuleInstance<T> = RuleInstance<T, [T]>;

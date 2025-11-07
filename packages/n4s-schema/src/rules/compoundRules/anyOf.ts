import { mapFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function anyOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, res);
    }) || RuleRunReturn.Failing(value)
  );
}

// Type for anyOf rule instance
export type AnyOfRuleInstance<T> = RuleInstance<T, [T]>;

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface ValueFirstRules {
      anyOf: <T>(
        value: T,
        ...rules: RuleInstance<T, any>[]
      ) => RuleRunReturn<T>;
    }
  }
}

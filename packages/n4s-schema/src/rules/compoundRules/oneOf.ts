import { greaterThan } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

const REQUIRED_COUNT = 1;

export function oneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  let passingCount = 0;
  rules.some(rule => {
    const res = rule.run(value);

    if (res.pass) {
      passingCount++;
    }

    if (greaterThan(passingCount, REQUIRED_COUNT)) {
      return RuleRunReturn.Failing(value);
    }
  });

  return RuleRunReturn.create(passingCount === REQUIRED_COUNT, value);
}

// Type for oneOf rule instance
export type OneOfRuleInstance<T> = RuleInstance<T, [T]>;

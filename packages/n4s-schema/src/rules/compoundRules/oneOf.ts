import { greaterThan } from 'vest-utils';

import { RuleRunReturn, ruleRunReturn } from 'enforceUtil';

const REQUIRED_COUNT = 1;

export function oneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  let passingCount = 0;
  rules.some(rule => {
    const res = rule.run(value);

    if (res.pass) {
      passingCount++;
    }

    if (greaterThan(passingCount, REQUIRED_COUNT)) {
      return false;
    }
  });

  return ruleRunReturn(passingCount === REQUIRED_COUNT, value);
}

import { greaterThan } from 'vest-utils';

import { equals } from 'equals';
import type { Lazy } from 'genEnforceLazy';
import ruleReturn, { RuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

const REQUIRED_COUNT = 1;

export function oneOf(value: unknown, ...rules: Lazy[]): RuleDetailedResult {
  let passingCount = 0;
  rules.some(rule => {
    const res = runLazyRule(rule, value);

    if (res.pass) {
      passingCount++;
    }

    if (greaterThan(passingCount, REQUIRED_COUNT)) {
      return false;
    }
  });

  return ruleReturn(equals(passingCount, REQUIRED_COUNT));
}

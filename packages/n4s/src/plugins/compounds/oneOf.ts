import type { Lazy } from 'genEnforceLazy';
import { lengthEquals } from 'lengthEquals';
import { longerThan } from 'longerThan';
import ruleReturn, { RuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

const REQUIRED_COUNT = 1;

export function oneOf(value: unknown, ...rules: Lazy[]): RuleDetailedResult {
  const passing: RuleDetailedResult[] = [];
  rules.some(rule => {
    if (longerThan(passing, REQUIRED_COUNT)) {
      return false;
    }

    const res = runLazyRule(rule, value);

    if (res.pass) {
      passing.push(res);
    }
  });

  return ruleReturn(lengthEquals(passing, REQUIRED_COUNT));
}

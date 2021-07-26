import type { TLazy } from 'genEnforceLazy';
import { lengthEquals } from 'lengthEquals';
import type { TRuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function oneOf(
  value: unknown,
  ...rules: TLazy[]
): TRuleDetailedResult {
  const passing: TRuleDetailedResult[] = [];

  rules.every(rule => {
    if (passing.length > 1) {
      return false;
    }

    const res = runLazyRule(rule, value);

    if (res.pass) {
      passing.push(res);
    }
    return res.pass;
  });

  return { pass: lengthEquals(passing, 1) };
}

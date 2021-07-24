import { lengthEquals } from 'lengthEquals';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';

export default function oneOf(
  value: unknown,
  ...rules: TLazyRuleMethods[]
): TRuleDetailedResult {
  const passing: TRuleDetailedResult[] = [];

  rules.every(rule => {
    if (passing.length > 1) {
      return false;
    }

    const result = rule.run(value);

    if (result.pass) {
      passing.push(result);
    }
    return result.pass;
  });

  return { pass: lengthEquals(passing, 1) };
}

import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';

export default function runLazyRule(
  lazyRule: TLazyRuleMethods,
  currentValue: any
): TRuleDetailedResult {
  try {
    return lazyRule.run(currentValue);
  } catch {
    return ruleReturn.failing();
  }
}

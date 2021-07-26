import type { TLazy } from 'genEnforceLazy';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';

export default function runLazyRule(
  lazyRule: TLazy,
  currentValue: any
): TRuleDetailedResult {
  try {
    return lazyRule.run(currentValue);
  } catch {
    return ruleReturn.failing();
  }
}

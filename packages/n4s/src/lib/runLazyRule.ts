import type { TLazyRuleRunners } from 'genEnforceLazy';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';

export default function runLazyRule(
  lazyRule: TLazyRuleRunners,
  currentValue: any
): TRuleDetailedResult {
  try {
    return lazyRule.run(currentValue);
  } catch {
    return ruleReturn.failing();
  }
}

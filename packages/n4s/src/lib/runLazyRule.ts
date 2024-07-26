import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';
import type { LazyRuleRunners } from '@/runtime/genEnforceLazy';

export default function runLazyRule(
  lazyRule: LazyRuleRunners,
  currentValue: any,
): RuleDetailedResult {
  try {
    return lazyRule.run(currentValue);
  } catch {
    return ruleReturn.failing();
  }
}

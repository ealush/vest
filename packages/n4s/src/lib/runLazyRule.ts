import type { LazyRuleRunners } from 'genEnforceLazy';
import type { RuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';

export default function runLazyRule(
  lazyRule: LazyRuleRunners,
  currentValue: any
): RuleDetailedResult {
  try {
    return lazyRule.run(currentValue);
  } catch {
    return ruleReturn.failing();
  }
}

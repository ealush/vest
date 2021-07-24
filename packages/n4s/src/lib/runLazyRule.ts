import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';

export default function runLazyRule(
  lazyRule: TLazyRuleMethods,
  currentValue: any
): TRuleDetailedResult {
  return lazyRule.run(currentValue);
}

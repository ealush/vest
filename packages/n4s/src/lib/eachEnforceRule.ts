import isFunction from 'isFunction';

import { baseRules, getRule, KBaseRules, TRuleBase } from 'runtimeRules';

export default function eachEnforceRule(
  action: (ruleName: KBaseRules, rule: TRuleBase) => void
) {
  for (const ruleName in baseRules) {
    const ruleFn = getRule(ruleName);
    if (isFunction(ruleFn)) {
      action(ruleName as KBaseRules, ruleFn);
    }
  }
}

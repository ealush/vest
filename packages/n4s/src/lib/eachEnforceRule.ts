import isFunction from 'isFunction';

import { baseRules, getRule, TBaseRules, TRuleBase } from 'runtimeRules';

export default function eachEnforceRule(
  action: (ruleName: TBaseRules, rule: TRuleBase) => void
) {
  for (const ruleName in baseRules) {
    const ruleFn = getRule(ruleName);
    if (isFunction(ruleFn)) {
      action(ruleName as TBaseRules, ruleFn);
    }
  }
}

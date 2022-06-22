import { isFunction } from 'vest-utils';

import { baseRules, getRule, KBaseRules, RuleBase } from 'runtimeRules';

export default function eachEnforceRule(
  action: (ruleName: KBaseRules, rule: RuleBase) => void
) {
  for (const ruleName in baseRules) {
    const ruleFn = getRule(ruleName);
    if (isFunction(ruleFn)) {
      action(ruleName as KBaseRules, ruleFn);
    }
  }
}

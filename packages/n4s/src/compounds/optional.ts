import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function optional(
  value: any,
  ruleChain: TLazyRuleMethods
): TRuleDetailedResult {
  if (isUndefined(value) || isNull(value)) {
    return ruleReturn.passing();
  }
  return runLazyRule(ruleChain, value);
}

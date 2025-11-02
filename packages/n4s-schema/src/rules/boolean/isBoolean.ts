import { RuleInstance } from 'enforceUtil';

export { isBoolean } from 'vest-utils';

export interface BooleanRuleInstance extends RuleInstance<boolean, [boolean]> {
  isTrue(): BooleanRuleInstance;
  isFalse(): BooleanRuleInstance;
  isTruthy(): BooleanRuleInstance;
  isFalsy(): BooleanRuleInstance;
  equals(v: boolean): BooleanRuleInstance;
  isBoolean(): BooleanRuleInstance;
}

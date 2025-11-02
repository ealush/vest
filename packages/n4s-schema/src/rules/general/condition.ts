import { RuleInstance } from 'enforceUtil';

export interface ConditionRuleInstance extends RuleInstance<boolean, [any]> {}

export function condition(cond: boolean): boolean {
  return cond;
}

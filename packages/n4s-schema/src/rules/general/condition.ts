import { RuleInstance } from '../../enforce';

export interface ConditionRuleInstance extends RuleInstance<boolean, [any]> {}

export function condition(cond: boolean): boolean {
  return cond;
}

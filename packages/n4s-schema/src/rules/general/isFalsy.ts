import { RuleInstance } from '../../enforce';

export interface FalsyRuleInstance extends RuleInstance<any, [any]> {}

export function isFalsy(value: any): boolean {
  return !value;
}

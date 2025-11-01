import { RuleInstance } from 'enforce';

export interface TruthyRuleInstance extends RuleInstance<any, [any]> {}

export function isTruthy(value: any): boolean {
  return !!value;
}

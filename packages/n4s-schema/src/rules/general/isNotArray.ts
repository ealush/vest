import { RuleInstance } from '../../enforce';

export interface NotArrayRuleInstance extends RuleInstance<any, [any]> {}

export function isNotArray(value: any): boolean {
  return !Array.isArray(value);
}

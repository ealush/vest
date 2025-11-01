import { RuleInstance } from '../../enforce';

export interface NotBooleanRuleInstance extends RuleInstance<any, [any]> {}

export function isNotBoolean(value: any): boolean {
  return typeof value !== 'boolean';
}

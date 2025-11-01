import { RuleInstance } from '../../enforce';

export interface NotStringRuleInstance extends RuleInstance<any, [any]> {}

export function isNotString(value: any): boolean {
  return typeof value !== 'string';
}

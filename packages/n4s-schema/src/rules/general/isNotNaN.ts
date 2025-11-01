import { RuleInstance } from '../../enforce';

export interface NotNaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNaN(value: any): boolean {
  return !Number.isNaN(value);
}

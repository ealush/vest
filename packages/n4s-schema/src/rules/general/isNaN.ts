import { RuleInstance } from 'enforce';

export interface NaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNaN(value: any): boolean {
  return Number.isNaN(value);
}

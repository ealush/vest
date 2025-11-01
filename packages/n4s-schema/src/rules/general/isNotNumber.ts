import { RuleInstance } from '../../enforce';

export interface NotNumberRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNumber(value: any): boolean {
  return typeof value !== 'number' || Number.isNaN(value);
}

import { RuleInstance } from 'enforce';
import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

export interface NotEmptyRuleInstance extends RuleInstance<any, [any]> {}

export function isNotEmpty(value: any): boolean {
  return isNotEmptyValue(value);
}

import { RuleInstance } from 'enforce';
import { isEmpty as isEmptyValue } from 'vest-utils';

export interface EmptyRuleInstance extends RuleInstance<any, [any]> {}

export function isEmpty(value: any): boolean {
  return isEmptyValue(value);
}

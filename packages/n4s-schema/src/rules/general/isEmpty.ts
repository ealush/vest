import { isEmpty as isEmptyValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

export interface EmptyRuleInstance extends RuleInstance<any, [any]> {}

export function isEmpty(value: any): boolean {
  return isEmptyValue(value);
}

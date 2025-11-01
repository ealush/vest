import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

export interface NotEmptyRuleInstance extends RuleInstance<any, [any]> {}

export function isNotEmpty(value: any): boolean {
  return isNotEmptyValue(value);
}

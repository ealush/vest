import { RuleInstance } from '../../enforce';

import { equals } from './equals';
import { falsy } from './falsy';
import { isFalse } from './isFalse';
import { isTrue } from './isTrue';
import { truthy } from './truthy';

export interface BooleanRuleInstance extends RuleInstance<boolean, [boolean]> {
  isTrue(): BooleanRuleInstance;
  isFalse(): BooleanRuleInstance;
  isTruthy(): BooleanRuleInstance;
  isFalsy(): BooleanRuleInstance;
  equals(v: boolean): BooleanRuleInstance;
}

export const booleanRules = {
  equals,
  isFalse,
  isFalsy: falsy,
  isTrue,
  isTruthy: truthy,
};

export function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}
